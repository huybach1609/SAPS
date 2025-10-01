// LoginViewModel.cs
using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.ApplicationLifetimes;
using ReactiveUI;
using SAPLDesktopApp.DTOs.Concrete.UserDtos;
using SAPLDesktopApp.Services;
using System;
using System.Globalization;
using System.Net.Http;
using System.Reactive;
using System.Reactive.Linq;
using System.Threading.Tasks;

namespace SAPLDesktopApp.ViewModels
{
    public class LoginViewModel : ViewModelBase
    {
        // Private fields
        private string _email = "";
        private string _password = "";
        private bool _isLoading = false;
        private string _loadingMessage = Resources.TextResource.LoadingConnecting;
        private string _loginError = "";
        private string _emailError = "";
        private string _passwordError = "";
        private bool _isLoginSuccessful = false;

        // Services
        private readonly IAuthenticationService _authService;

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

        public string Password
        {
            get => _password;
            set
            {
                this.RaiseAndSetIfChanged(ref _password, value);
                ClearPasswordError();
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

        public string LoginError
        {
            get => _loginError;
            set => this.RaiseAndSetIfChanged(ref _loginError, value);
        }

        public string EmailError
        {
            get => _emailError;
            set => this.RaiseAndSetIfChanged(ref _emailError, value);
        }

        public string PasswordError
        {
            get => _passwordError;
            set => this.RaiseAndSetIfChanged(ref _passwordError, value);
        }

        public bool IsLoginSuccessful
        {
            get => _isLoginSuccessful;
            set => this.RaiseAndSetIfChanged(ref _isLoginSuccessful, value);
        }

        // Computed properties
        public bool HasLoginError => !string.IsNullOrEmpty(LoginError);
        public bool HasEmailError => !string.IsNullOrEmpty(EmailError);
        public bool HasPasswordError => !string.IsNullOrEmpty(PasswordError);

        // Validation
        public bool CanLogin => !string.IsNullOrWhiteSpace(Email) &&
                               !string.IsNullOrWhiteSpace(Password) &&
                               !IsLoading &&
                               !HasEmailError &&
                               !HasPasswordError;

        // Commands
        public ReactiveCommand<Unit, Unit> LoginCommand { get; }
        public ReactiveCommand<Unit, Unit> ForgotPasswordCommand { get; }

        // Constructor
        public LoginViewModel()
        {
            // Get authentication service from ServiceLocator
            _authService = ServiceLocator.GetService<IAuthenticationService>();

            // Initialize loading message from resources
            _loadingMessage = Resources.TextResource.LoadingConnecting;

            // Initialize commands
            var canLogin = this.WhenAnyValue(
                x => x.Email,
                x => x.Password,
                x => x.IsLoading,
                x => x.HasEmailError,
                x => x.HasPasswordError,
                (email, password, loading, emailErr, passErr) =>
                    !string.IsNullOrWhiteSpace(email) &&
                    !string.IsNullOrWhiteSpace(password) &&
                    !loading &&
                    !emailErr &&
                    !passErr);

            LoginCommand = ReactiveCommand.CreateFromTask(ExecuteLogin, canLogin);
            ForgotPasswordCommand = ReactiveCommand.Create(ExecuteForgotPassword);

            // Subscribe to property changes for computed properties
            this.WhenAnyValue(x => x.LoginError)
                .Subscribe(_ => this.RaisePropertyChanged(nameof(HasLoginError)));

            this.WhenAnyValue(x => x.EmailError)
                .Subscribe(_ => this.RaisePropertyChanged(nameof(HasEmailError)));

            this.WhenAnyValue(x => x.PasswordError)
                .Subscribe(_ => this.RaisePropertyChanged(nameof(HasPasswordError)));

            this.WhenAnyValue(
                x => x.Email,
                x => x.Password,
                x => x.IsLoading,
                x => x.HasEmailError,
                x => x.HasPasswordError)
                .Subscribe(_ => this.RaisePropertyChanged(nameof(CanLogin)));
        }

        // Command implementations
        private async Task ExecuteLogin()
        {
            try
            {
                // Clear previous errors
                ClearAllErrors();

                // Validate inputs
                if (!ValidateInputs())
                    return;

                // Start loading
                IsLoading = true;
                LoadingMessage = Resources.TextResource.LoadingConnecting;

                // Create authentication request
                var loginRequest = new AuthenticateUserRequest
                {
                    Email = Email.Trim(),
                    Password = Password,
                    RememberMe = false // Always set to false since we're removing this functionality
                };

                // Attempt authentication
                await _authService.LoginAsync(loginRequest);

                LoadingMessage = Resources.TextResource.LoginSuccessMessage;
                await Task.Delay(500); // Brief success message
                OpenMainWindow();

                // Set login as successful
                IsLoginSuccessful = true;

                // Open main window with user information
            }
            catch (HttpRequestException httpEx)
            {
                // Handle HTTP-specific errors
                if (httpEx.Message.Contains("401") || httpEx.Message.Contains("Unauthorized"))
                {
                    LoginError = Resources.TextResource.LoginErrorInvalidCredentials;
                }
                else if (httpEx.Message.Contains("404"))
                {
                    LoginError = Resources.TextResource.LoginErrorServiceUnavailable;
                }
                else if (httpEx.Message.Contains("500"))
                {
                    LoginError = Resources.TextResource.LoginErrorServerError;
                }
                else
                {
                    LoginError = string.Format(Resources.TextResource.LoginErrorNetworkError, httpEx.Message);
                }
            }
            catch (InvalidOperationException opEx)
            {
                LoginError = string.Format(Resources.TextResource.LoginErrorLoginFailed, opEx.Message);
            }
            catch (Exception ex)
            {
                LoginError = string.Format(Resources.TextResource.LoginErrorUnexpected, ex.Message);
                System.Diagnostics.Debug.WriteLine($"Login error: {ex}");
            }
            finally
            {
                IsLoading = false;
            }
        }

        private void ExecuteForgotPassword()
        {
            if (Application.Current?.ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop) {
                var forgotPasswordWindow = new SAPLDesktopApp.Views.ForgotPasswordWindow();
                forgotPasswordWindow.ShowDialog(desktop.MainWindow!);
            }
        }

        // Helper methods
        private bool ValidateInputs()
        {
            bool isValid = true;

            // Validate Email
            if (string.IsNullOrWhiteSpace(Email))
            {
                EmailError = Resources.TextResource.ValidationEmailRequired;
                isValid = false;
            }
            else if (!IsValidEmail(Email.Trim()))
            {
                EmailError = Resources.TextResource.ValidationEmailInvalid;
                isValid = false;
            }

            // Validate Password
            if (string.IsNullOrWhiteSpace(Password))
            {
                PasswordError = Resources.TextResource.ValidationPasswordRequired;
                isValid = false;
            }
            else if (Password.Length < 4)
            {
                PasswordError = Resources.TextResource.ValidationPasswordTooShort;
                isValid = false;
            }

            return isValid;
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

        private void ClearAllErrors()
        {
            LoginError = "";
            ClearEmailError();
            ClearPasswordError();
        }

        private void ClearEmailError()
        {
            EmailError = "";
        }

        private void ClearPasswordError()
        {
            PasswordError = "";
        }

        private void OpenMainWindow()
        {
            try
            {
                // Get the current user and token from authentication service
                var currentUser = _authService.CurrentUser;
                var currentToken = _authService.CurrentToken;

                if (currentUser == null || currentToken == null)
                {
                    LoginError = Resources.TextResource.LoginErrorAuthenticationFailed;
                    return;
                }

                // Create and show main window with user information
                var mainWindow = new SAPLDesktopApp.Views.MainWindow
                {
                    DataContext = new MainWindowViewModel(currentUser, currentToken)
                };

                if (Application.Current?.ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
                {
                    desktop.MainWindow = mainWindow;
                    mainWindow.Show();

                    System.Diagnostics.Debug.WriteLine("LoginViewModel: MainWindow set as application main window");
                }
            }
            catch (Exception ex)
            {
                LoginError = string.Format(Resources.TextResource.LoginErrorFailedToOpenApplication, ex.Message);
                IsLoginSuccessful = false;
            }
        }
    }
}