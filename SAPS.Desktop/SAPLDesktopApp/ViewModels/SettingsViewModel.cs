using Avalonia;
using ReactiveUI;
using SAPLDesktopApp.DTOs.Concrete.UserDtos;
using SAPLDesktopApp.Models;
using SAPLDesktopApp.Services;
using System;
using System.Collections.ObjectModel;
using System.Reactive;
using System.Threading.Tasks;
using System.Windows.Input;

namespace SAPLDesktopApp.ViewModels
{
    public class SettingsViewModel : ViewModelBase, IRoutableViewModel
    {
        public string? UrlPathSegment { get; }
        public IScreen HostScreen { get; }

        private readonly ISettingsService _settingsService;
        private readonly IUserService _userService;
        private readonly INotificationService _notificationService;

        private ObservableCollection<LanguageOptionViewModel> _availableLanguages = new();
        private string _currentPassword = string.Empty;
        private string _newPassword = string.Empty;
        private string _confirmPassword = string.Empty;
        private bool _notificationsEnabled = true;
        private bool _autoSaveEnabled = true;

        public ObservableCollection<LanguageOptionViewModel> AvailableLanguages
        {
            get => _availableLanguages;
            set => this.RaiseAndSetIfChanged(ref _availableLanguages, value);
        }

        public bool NotificationsEnabled
        {
            get => _notificationsEnabled;
            set => this.RaiseAndSetIfChanged(ref _notificationsEnabled, value);
        }

        public bool AutoSaveEnabled
        {
            get => _autoSaveEnabled;
            set => this.RaiseAndSetIfChanged(ref _autoSaveEnabled, value);
        }
        public string CurrentPassword
        {
            get => _currentPassword;
            set => this.RaiseAndSetIfChanged(ref _currentPassword, value);
        }
        public string NewPassword
        {
            get => _newPassword;
            set => this.RaiseAndSetIfChanged(ref _newPassword, value);
        }
        public string ConfirmPassword
        {
            get => _confirmPassword;
            set => this.RaiseAndSetIfChanged(ref _confirmPassword, value);
        }

        public ICommand BackCommand { get; }
        public ReactiveCommand<Unit, Unit> ChangePasswordCommand { get; }
        public ReactiveCommand<LanguageOptionViewModel, Unit> ChangeLanguageCommand { get; }
        public ReactiveCommand<Unit, Unit> ResetPasswordFormCommand { get; }

        // Simple boolean property for checking if password fields are filled
        public bool CanChangePassword => 
            !string.IsNullOrWhiteSpace(CurrentPassword) &&
            !string.IsNullOrWhiteSpace(NewPassword) &&
            !string.IsNullOrWhiteSpace(ConfirmPassword) &&
            NewPassword == ConfirmPassword;

        public SettingsViewModel(IScreen screen)
        {
            HostScreen = screen;
            UrlPathSegment = "settings";
            _settingsService = ServiceLocator.GetService<ISettingsService>();
            _userService = ServiceLocator.GetService<IUserService>();
            _notificationService = ServiceLocator.GetService<INotificationService>();

            BackCommand = ReactiveCommand.Create(GoBack);
            
            ChangePasswordCommand = ReactiveCommand.CreateFromTask(ChangePasswordAsync);
                
            ChangeLanguageCommand = ReactiveCommand.CreateFromTask<LanguageOptionViewModel>(ChangeLanguageAsync);
            ResetPasswordFormCommand = ReactiveCommand.Create(ResetPasswordForm);

            // Subscribe to password model changes to update CanChangePassword
            this.WhenAnyValue(
                x => x.CurrentPassword,
                x => x.NewPassword,
                x => x.ConfirmPassword)
                .Subscribe(_ => this.RaisePropertyChanged(nameof(CanChangePassword)));

            // Load initial data
            _ = LoadDataAsync();
        }

        private void GoBack()
        {
            HostScreen.Router.NavigateBack.Execute().Subscribe();
        }

        private async Task LoadDataAsync()
        {
            try
            {
                // Load current settings
                var settings = await _settingsService.GetUserSettingsAsync();
                NotificationsEnabled = settings.NotificationsEnabled;
                AutoSaveEnabled = settings.AutoSaveEnabled;

                // Load available languages and create ViewModels
                var languages = await _settingsService.GetAvailableLanguagesAsync();
                var languageViewModels = new ObservableCollection<LanguageOptionViewModel>();
                
                foreach (var language in languages)
                {
                    languageViewModels.Add(new LanguageOptionViewModel(language));
                }
                
                AvailableLanguages = languageViewModels;
            }
            catch (Exception ex)
            {
                await _notificationService.ShowErrorNotificationAsync("Settings Error", $"Failed to load settings: {ex.Message}");
            }
        }

        private async Task ChangePasswordAsync()
        {
            try
            {
                // Validate password fields
                if (string.IsNullOrWhiteSpace(CurrentPassword))
                {
                    await _notificationService.ShowErrorNotificationAsync("Validation Error", "Current password is required");
                    return;
                }

                if (string.IsNullOrWhiteSpace(NewPassword))
                {
                    await _notificationService.ShowErrorNotificationAsync("Validation Error", "New password is required");
                    return;
                }

                if (NewPassword.Length < 8 || NewPassword.Length > 24)
                {
                    await _notificationService.ShowErrorNotificationAsync("Validation Error", "New password must be between 8 and 24 characters");
                    return;
                }

                if (NewPassword != ConfirmPassword)
                {
                    await _notificationService.ShowErrorNotificationAsync("Validation Error", "New passwords do not match");
                    return;
                }

                // Create the update password request
                var request = new UpdateUserPasswordRequest
                {
                    Id = AuthenticationState.CurrentUser?.Id ?? string.Empty,
                    OldPassword = CurrentPassword,
                    NewPassword = NewPassword
                };

                // Update password using the UserService
                var success = await _userService.UpdatePasswordAsync(request);

                // Also update saved credentials in settings if needed
                if (success)
                {
                    await _notificationService.ShowNotificationAsync("Password Changed", "Your password has been updated successfully");
                    ResetPasswordForm();
                }
            }
            catch (UnauthorizedAccessException)
            {
                await _notificationService.ShowErrorNotificationAsync("Authentication Error", "Your session has expired. Please login again.");
            }
            catch (InvalidOperationException ex)
            {
                await _notificationService.ShowErrorNotificationAsync("Password Change Failed", ex.Message);
            }
            catch (Exception ex)
            {
                await _notificationService.ShowErrorNotificationAsync("Password Change Failed", $"An error occurred: {ex.Message}");
            }
        }

        private async Task ChangeLanguageAsync(LanguageOptionViewModel languageViewModel)
        {
            try
            {
                if (languageViewModel?.Language == null) return;

                // Use the confirmation method that shows restart dialog
                var shouldRestart = await _settingsService.ChangeLanguageWithConfirmationAsync(languageViewModel.Language.Code);

                if (shouldRestart)
                {
                    if (HostScreen is MainWindowViewModel mainWindowViewModel)
                    {
                        mainWindowViewModel.RequestApplicationRestart();
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ChangeLanguageAsync error: {ex.Message}");
            }
        }

        private void ResetPasswordForm()
        {
            CurrentPassword = string.Empty;
            NewPassword = string.Empty;
            ConfirmPassword = string.Empty;
        }
    }

    // ViewModel wrapper for LanguageOption to handle UI logic
    public class LanguageOptionViewModel : ViewModelBase
    {
        private bool _isSelected;

        public LanguageOption Language { get; }

        public bool IsSelected
        {
            get => _isSelected;
            set => this.RaiseAndSetIfChanged(ref _isSelected, value);
        }

        // UI Properties for styling based on selection state
        public string SelectionBackgroundColor => IsSelected ? "#E3F2FD" : "White";
        public string SelectionBorderColor => IsSelected ? "#2196F3" : "#E0E0E0";
        public bool CheckmarkVisibility => IsSelected;

        public LanguageOptionViewModel(LanguageOption language)
        {
            Language = language;
            IsSelected = language.IsSelected;

            // Update UI properties when selection changes
            this.WhenAnyValue(x => x.IsSelected)
                .Subscribe(_ =>
                {
                    this.RaisePropertyChanged(nameof(SelectionBackgroundColor));
                    this.RaisePropertyChanged(nameof(SelectionBorderColor));
                    this.RaisePropertyChanged(nameof(CheckmarkVisibility));
                });
        }
    }
}