using ReactiveUI;
using SAPLDesktopApp.Services;
using System;
using System.Reactive;
using System.Threading.Tasks;

namespace SAPLDesktopApp.ViewModels
{
    public class ForgotPasswordViewModel : ViewModelBase
    {
        // Private fields
        private string _email = "";
        private bool _isLoading = false;
        private string _loadingMessage = "";
        private string _errorMessage = "";
        private string _successMessage = "";
        private string _emailError = "";

        // Services
        private readonly IUserService _userService;

        // Properties
        public string Email
        {
            get => _email;
            set
            {
                this.RaiseAndSetIfChanged(ref _email, value);
                ClearEmailError();
            }
        }

        public bool IsLoading
        {
            get => _isLoading;
            set => this.RaiseAndSetIfChanged(ref _isLoading, value);
        }

        public string LoadingMessage
        {
            get => _loadingMessage;
            set => this.RaiseAndSetIfChanged(ref _loadingMessage, value);
        }

        public string ErrorMessage
        {
            get => _errorMessage;
            set => this.RaiseAndSetIfChanged(ref _errorMessage, value);
        }

        public string SuccessMessage
        {
            get => _successMessage;
            set => this.RaiseAndSetIfChanged(ref _successMessage, value);
        }

        public string EmailError
        {
            get => _emailError;
            set => this.RaiseAndSetIfChanged(ref _emailError, value);
        }

        // Computed properties for UI binding
        public bool HasErrorMessage => !string.IsNullOrEmpty(ErrorMessage);
        public bool HasSuccessMessage => !string.IsNullOrEmpty(SuccessMessage);
        public bool HasEmailError => !string.IsNullOrEmpty(EmailError);

        // Validation
        public bool CanRequestReset => !string.IsNullOrWhiteSpace(Email) &&
                                      !IsLoading &&
                                      !HasEmailError;

        // Commands
        public ReactiveCommand<Unit, Unit> RequestResetCommand { get; }
        public ReactiveCommand<Unit, Unit> BackToLoginCommand { get; }

        // Events
        public event Action? BackToLoginRequested;
        public event Action? RequestCompleted;

        public ForgotPasswordViewModel()
        {
            // Get services from ServiceLocator
            _userService = ServiceLocator.GetService<IUserService>();

            // Initialize commands
            RequestResetCommand = ReactiveCommand.CreateFromTask(ExecuteRequestReset, 
                this.WhenAnyValue(x => x.CanRequestReset));

            BackToLoginCommand = ReactiveCommand.Create(ExecuteBackToLogin);

            // Subscribe to property changes for computed properties
            this.WhenAnyValue(x => x.ErrorMessage)
                .Subscribe(_ => this.RaisePropertyChanged(nameof(HasErrorMessage)));

            this.WhenAnyValue(x => x.SuccessMessage)
                .Subscribe(_ => this.RaisePropertyChanged(nameof(HasSuccessMessage)));

            this.WhenAnyValue(x => x.EmailError)
                .Subscribe(_ => this.RaisePropertyChanged(nameof(HasEmailError)));

            this.WhenAnyValue(
                x => x.Email,
                x => x.IsLoading,
                x => x.HasEmailError)
                .Subscribe(_ => this.RaisePropertyChanged(nameof(CanRequestReset)));
        }

        // Command implementations
        private async Task ExecuteRequestReset()
        {
            try
            {
                ClearAllMessages();

                if (!ValidateEmail())
                    return;

                IsLoading = true;
                LoadingMessage = Resources.TextResource.ForgotPasswordSendingRequest;

                // Send password reset request
                await _userService.RequestResetPasswordAsync(Email.Trim());

                SuccessMessage = Resources.TextResource.ForgotPasswordRequestSentMessage;

                System.Diagnostics.Debug.WriteLine($"ForgotPasswordViewModel: Password reset requested for {Email}");

                // Wait a moment to show the success message, then trigger completion
                await Task.Delay(3000);
                RequestCompleted?.Invoke();
            }
            catch (InvalidOperationException ex)
            {
                ErrorMessage = ex.Message;
                System.Diagnostics.Debug.WriteLine($"ForgotPasswordViewModel: Invalid operation: {ex.Message}");
            }
            catch (ArgumentException ex)
            {
                ErrorMessage = ex.Message;
                System.Diagnostics.Debug.WriteLine($"ForgotPasswordViewModel: Argument error: {ex.Message}");
            }
            catch (Exception ex)
            {
                ErrorMessage = string.Format(Resources.TextResource.ForgotPasswordRequestFailedMessage, ex.Message);
                System.Diagnostics.Debug.WriteLine($"ForgotPasswordViewModel: Error requesting password reset: {ex.Message}");
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "";
            }
        }

        private void ExecuteBackToLogin()
        {
            BackToLoginRequested?.Invoke();
        }

        // Helper methods
        private bool ValidateEmail()
        {
            if (string.IsNullOrWhiteSpace(Email))
            {
                EmailError = Resources.TextResource.ValidationEmailRequired;
                return false;
            }

            if (!IsValidEmail(Email.Trim()))
            {
                EmailError = Resources.TextResource.ValidationEmailInvalid;
                return false;
            }

            return true;
        }

        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        private void ClearAllMessages()
        {
            ErrorMessage = "";
            SuccessMessage = "";
        }

        private void ClearEmailError()
        {
            EmailError = "";
        }
    }
}