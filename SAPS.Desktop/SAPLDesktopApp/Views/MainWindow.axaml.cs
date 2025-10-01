using Avalonia.Controls;
using Avalonia.ReactiveUI;
using ReactiveUI;
using SAPLDesktopApp.ViewModels;
using SAPLDesktopApp.Services;
using Avalonia;
using System;

namespace SAPLDesktopApp.Views
{
    public partial class MainWindow : ReactiveWindow<MainWindowViewModel>
    {
        public MainWindow()
        {
            InitializeComponent();
            InitializeServices();

            this.WhenActivated(disposables =>
            {
                this.OneWayBind(ViewModel, x => x.Router, x => x.RoutedViewHost.Router);
                
                // Subscribe to RequestClose event from ViewModel
                if (ViewModel != null)
                {
                    ViewModel.RequestClose += OnRequestClose;
                }
            });

            ExitButton.Click += (sender, e) =>
            {
                Close();
            };

            // Handle application closing to properly dispose cameras
            Closing += OnWindowClosing;
        }

        private void OnRequestClose()
        {
            try
            {
                System.Diagnostics.Debug.WriteLine("MainWindow: Close requested by ViewModel");
                Close();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"MainWindow: Error closing window: {ex.Message}");
            }
        }

        private void OnWindowClosing(object? sender, Avalonia.Controls.WindowClosingEventArgs e)
        {
            try
            {
                // Unsubscribe from ViewModel events
                if (ViewModel != null)
                {
                    ViewModel.RequestClose -= OnRequestClose;
                }

                // Dispose cameras when the application closes
                ViewModel?.Dispose();
                System.Diagnostics.Debug.WriteLine("MainWindow: Application closing, cameras disposed");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"MainWindow: Error during application shutdown: {ex.Message}");
            }
        }

        public void InitializeServices()
        {
            // Initialize popup host service
            var popupHost = this.FindControl<Grid>("PopupHost");
            if (popupHost != null)
            {
                var popupHostService = ServiceLocator.GetService<IPopupHostService>();
                popupHostService.Initialize(popupHost);
            }

            // Initialize notification host service
            var notificationHost = this.FindControl<StackPanel>("NotificationHost");
            if (notificationHost != null)
            {
                var notificationService = ServiceLocator.GetService<INotificationService>();
                notificationService.Initialize(notificationHost);
            }
        }
    }
}