using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Data.Core.Plugins;
using Avalonia.Markup.Xaml;
using Microsoft.Extensions.DependencyInjection;
using ReactiveUI;
using SAPLDesktopApp.Extensions;
using SAPLDesktopApp.Services;
using SAPLDesktopApp.ViewModels;
using SAPLDesktopApp.Views;
using Splat;
using System;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace SAPLDesktopApp
{
    public partial class App : Application
    {
        public override void Initialize()
        {
            AvaloniaXamlLoader.Load(this);
            Locator.CurrentMutable.RegisterViewsForViewModels(Assembly.GetCallingAssembly());
        }

        public override async void OnFrameworkInitializationCompleted()
        {
            // Configure dependency injection
            ServiceLocator.ConfigureServices(services =>
            {
                services.AddApplicationServices();
            });

            // Initialize settings before creating windows
            var settingsService = ServiceLocator.GetService<ISettingsService>();
            settingsService.Initialize();
            // Remove DataAnnotations validation plugin conflict
            BindingPlugins.DataValidators.RemoveAt(0);
            if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
            {
                // Subscribe to application shutdown event for cleanup
                desktop.ShutdownRequested += OnShutdownRequested;

                // Check if user is already authenticated
                var authService = ServiceLocator.GetService<IAuthenticationService>();
                var isUserAuthenticated = await CheckExistingAuthenticationAsync(authService);

                if (isUserAuthenticated && authService.CurrentUser != null && authService.CurrentToken != null)
                {
                    // User is authenticated, show main window with user information
                    desktop.MainWindow = new MainWindow
                    {
                        DataContext = new MainWindowViewModel(authService.CurrentUser, authService.CurrentToken)
                    };
                }
                else
                {
                    // No authenticated user, show login window
                    desktop.MainWindow = new LoginWindow
                    {
                        DataContext = ActivatorUtilities.CreateInstance<LoginViewModel>(ServiceLocator.ServiceProvider)
                    };
                }
            }

            base.OnFrameworkInitializationCompleted();
        }

        /// <summary>
        /// Handle application shutdown - cleanup resources
        /// </summary>
        private void OnShutdownRequested(object? sender, ShutdownRequestedEventArgs e)
        {
            try
            {
                // Cleanup authentication service if needed
                var authService = ServiceLocator.GetService<IAuthenticationService>();
                authService?.Dispose();

                // Cleanup camera service if needed
                var cameraService = ServiceLocator.GetService<ICameraService>();
                cameraService?.Dispose();

                System.Diagnostics.Debug.WriteLine("App: Application cleanup completed");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"App: Error during cleanup: {ex.Message}");
            }
        }

        /// <summary>
        /// Check if there's an existing valid authentication session
        /// This could be extended to check for saved tokens in secure storage
        /// </summary>
        private async Task<bool> CheckExistingAuthenticationAsync(IAuthenticationService authService)
        {
            try
            {
                // For now, just check if the service has authentication state
                // In the future, you could implement:
                // 1. Check for saved refresh token in secure storage
                // 2. Attempt to refresh the access token
                // 3. Validate the current token isn't expired
                
                if (authService.IsAuthenticated && authService.CurrentToken != null)
                {
                    // Check if token is still valid (not expired)
                    if (!authService.CurrentToken.IsExpired)
                    {
                        System.Diagnostics.Debug.WriteLine("App: Found valid existing authentication session");
                        return true;
                    }
                    else
                    {
                        // Token expired, try to refresh it
                        System.Diagnostics.Debug.WriteLine("App: Token expired, attempting refresh...");
                        
                        if (!string.IsNullOrEmpty(authService.CurrentToken.RefreshToken))
                        {
                            try
                            {
                                var refreshRequest = new SAPLDesktopApp.DTOs.Concrete.UserDtos.RefreshTokenRequest
                                {
                                    RefreshToken = authService.CurrentToken.RefreshToken
                                };

                                await authService.RefreshAccessTokenAsync(refreshRequest);
                                
                                if (authService.IsAuthenticated && authService.CurrentToken != null && !authService.CurrentToken.IsExpired)
                                {
                                    System.Diagnostics.Debug.WriteLine("App: Token refreshed successfully");
                                    return true;
                                }
                            }
                            catch (Exception ex)
                            {
                                System.Diagnostics.Debug.WriteLine($"App: Token refresh failed: {ex.Message}");
                            }
                        }
                    }
                }

                System.Diagnostics.Debug.WriteLine("App: No valid authentication session found");
                return false;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"App: Error checking authentication: {ex.Message}");
                return false;
            }
        }
    }
}