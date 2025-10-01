using Avalonia.Controls;
using Avalonia.Threading;
using SAPLDesktopApp.Controls;
using SAPLDesktopApp.Models;
using SAPLDesktopApp.Helpers;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Reactive.Linq;
using System.Threading.Tasks;
using ReactiveUI;

namespace SAPLDesktopApp.Services
{
    public class NotificationService : INotificationService
    {
        private Panel? _notificationHost;
        private readonly ObservableCollection<VehicleNotification> _activeNotifications;
        private readonly object _notificationLock = new object();

        public ObservableCollection<VehicleNotification> ActiveNotifications => _activeNotifications;
        public bool HasActiveNotifications => _activeNotifications.Count > 0;

        public NotificationService()
        {
            _activeNotifications = new ObservableCollection<VehicleNotification>();
        }

        public void Initialize(Panel notificationHost)
        {
            _notificationHost = notificationHost ?? throw new ArgumentNullException(nameof(notificationHost));
            System.Diagnostics.Debug.WriteLine("NotificationService: Initialized with notification host");
        }

        public async Task ShowNotificationAsync(string title, string message, string licensePlate = "", NotificationType type = NotificationType.Info, TimeSpan? autoCloseTime = null)
        {
            if (_notificationHost == null)
            {
                throw new InvalidOperationException("NotificationHost must be initialized before use");
            }

            var notification = new VehicleNotification
            {
                Title = title,
                Message = message,
                LicensePlate = licensePlate,
                Type = type,
                AutoCloseTime = autoCloseTime ?? TimeSpan.FromSeconds(5)
            };

            await Dispatcher.UIThread.InvokeAsync(() =>
            {
                try
                {
                    // Add to collection (limit to 5 visible notifications)
                    lock (_notificationLock)
                    {
                        _activeNotifications.Insert(0, notification);

                        // Limit to 5 notifications max
                        while (_activeNotifications.Count > 5)
                        {
                            var oldest = _activeNotifications.Last();
                            RemoveNotificationFromHost(oldest);
                            _activeNotifications.RemoveAt(_activeNotifications.Count - 1);
                        }
                    }

                    // Create notification popup
                    var notificationPopup = new NotificationPopup(notification);
                    notificationPopup.CloseRequested += (_, _) => _ = CloseNotificationAsync(notification.Id!);

                    // Add to notification host
                    _notificationHost.Children.Insert(0, notificationPopup);

                    // Set up auto-close timer
                    SetupAutoCloseTimer(notification);

                    System.Diagnostics.Debug.WriteLine($"NotificationService: Notification shown - {title}");
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"NotificationService: Error showing notification - {ex.Message}");
                }
            });
        }

        public async Task ShowCheckInNotificationAsync(string licensePlate, string message = "")
        {
            var title = ResourceHelper.GetTextResource("NotificationTitleVehicleCheckIn", "Vehicle Checked In");
            var defaultMessage = ResourceHelper.GetTextResource("NotificationMessageVehicleCheckInSuccess", "Successfully checked in");
            var licensePrefix = ResourceHelper.GetTextResource("NotificationMessageLicensePlatePrefix", "License plate:");

            var actualMessage = string.IsNullOrEmpty(message) ? defaultMessage : message;
            var fullMessage = $"{actualMessage}\n{licensePrefix} {licensePlate}";

            await ShowNotificationAsync(title, fullMessage, licensePlate, NotificationType.CheckIn);
        }

        public async Task ShowCheckOutNotificationAsync(string licensePlate, string message = "")
        {
            var title = ResourceHelper.GetTextResource("NotificationTitleVehicleCheckOut", "Vehicle Checked Out");
            var defaultMessage = ResourceHelper.GetTextResource("NotificationMessageVehicleCheckOutSuccess", "Successfully checked out");
            var licensePrefix = ResourceHelper.GetTextResource("NotificationMessageLicensePlatePrefix", "License plate:");

            var actualMessage = string.IsNullOrEmpty(message) ? defaultMessage : message;
            var fullMessage = $"{actualMessage}\n{licensePrefix} {licensePlate}";

            await ShowNotificationAsync(title, fullMessage, licensePlate, NotificationType.CheckOut);
        }

        public async Task ShowErrorNotificationAsync(string title, string message)
        {
            var errorTitle = string.IsNullOrEmpty(title) 
                ? ResourceHelper.GetTextResource("NotificationTitleError", "Error") 
                : title;
            await ShowNotificationAsync(errorTitle, message, "", NotificationType.Error, TimeSpan.FromSeconds(8));
        }

        public async Task ShowWarningNotificationAsync(string title, string message)
        {
            var warningTitle = string.IsNullOrEmpty(title) 
                ? ResourceHelper.GetTextResource("NotificationTitleWarning", "Warning") 
                : title;
            await ShowNotificationAsync(warningTitle, message, "", NotificationType.Warning, TimeSpan.FromSeconds(6));
        }

        public async Task ShowInfoNotificationAsync(string title, string message)
        {
            var infoTitle = string.IsNullOrEmpty(title) 
                ? ResourceHelper.GetTextResource("NotificationTitleInfo", "Information") 
                : title;
            await ShowNotificationAsync(infoTitle, message, "", NotificationType.Info, TimeSpan.FromSeconds(4));
        }

        public async Task ShowSuccessNotificationAsync(string title, string message)
        {
            var successTitle = string.IsNullOrEmpty(title) 
                ? ResourceHelper.GetTextResource("NotificationTitleSuccess", "Success") 
                : title;
            await ShowNotificationAsync(successTitle, message, "", NotificationType.CheckIn, TimeSpan.FromSeconds(4));
        }

        public async Task ShowAlreadyCheckedInNotificationAsync(string licensePlate, string checkInTime)
        {
            var title = ResourceHelper.GetTextResource("NotificationTitleAlreadyCheckedIn", "Already Checked In");
            var messageTemplate = ResourceHelper.GetTextResource("NotificationMessageVehicleAlreadyCheckedIn", "is already checked in since");
            var message = $"Vehicle {licensePlate} {messageTemplate} {checkInTime}";

            await ShowNotificationAsync(title, message, licensePlate, NotificationType.Warning, TimeSpan.FromSeconds(6));
        }

        public async Task ShowNotCheckedInNotificationAsync(string licensePlate)
        {
            var title = ResourceHelper.GetTextResource("NotificationTitleNotCheckedIn", "Not Checked In");
            var messageTemplate = ResourceHelper.GetTextResource("NotificationMessageVehicleNotCheckedIn", "is not currently checked in and cannot be checked out");
            var message = $"Vehicle {licensePlate} {messageTemplate}";

            await ShowNotificationAsync(title, message, licensePlate, NotificationType.Error, TimeSpan.FromSeconds(7));
        }

        public async Task ShowActiveSessionsInfoAsync(string vehicleList)
        {
            var title = ResourceHelper.GetTextResource("NotificationTitleActiveSessions", "Active Sessions");
            var messagePrefix = ResourceHelper.GetTextResource("NotificationMessageCurrentlyCheckedInVehicles", "Currently checked-in vehicles:");
            var message = $"{messagePrefix} {vehicleList}";

            await ShowNotificationAsync(title, message, "", NotificationType.Info, TimeSpan.FromSeconds(5));
        }

        public async Task ShowNoActiveSessionsWarningAsync()
        {
            var title = ResourceHelper.GetTextResource("NotificationTitleNoActiveSessions", "No Active Sessions");
            var message = ResourceHelper.GetTextResource("NotificationMessageNoVehiclesToCheckOut", "There are no vehicles currently checked in to check out.");

            await ShowNotificationAsync(title, message, "", NotificationType.Warning, TimeSpan.FromSeconds(5));
        }

        public async Task ShowAvailableForCheckOutInfoAsync(string vehicleList)
        {
            var title = ResourceHelper.GetTextResource("NotificationTitleAvailableForCheckOut", "Available for Check-out");
            var messagePrefix = ResourceHelper.GetTextResource("NotificationMessageVehiclesAvailableForCheckOut", "Vehicles available for check-out:");
            var message = $"{messagePrefix} {vehicleList}";

            await ShowNotificationAsync(title, message, "", NotificationType.Info, TimeSpan.FromSeconds(5));
        }

        public async Task ShowProcessingErrorAsync(string operation, string errorMessage)
        {
            var title = ResourceHelper.GetTextResource("NotificationTitleProcessingError", "Processing Error");
            var message = $"Failed to {operation}: {errorMessage}";

            await ShowNotificationAsync(title, message, "", NotificationType.Error, TimeSpan.FromSeconds(8));
        }

        public async Task CloseNotificationAsync(string notificationId)
        {
            if (_notificationHost == null) return;

            await Dispatcher.UIThread.InvokeAsync(() =>
            {
                try
                {
                    var notification = _activeNotifications.FirstOrDefault(n => n.Id == notificationId);
                    if (notification != null)
                    {
                        RemoveNotificationFromHost(notification);
                        _activeNotifications.Remove(notification);
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"NotificationService: Error closing notification - {ex.Message}");
                }
            });
        }

        public async Task ClearAllNotificationsAsync()
        {
            if (_notificationHost == null) return;

            await Dispatcher.UIThread.InvokeAsync(() =>
            {
                try
                {
                    _notificationHost.Children.Clear();
                    _activeNotifications.Clear();
                    System.Diagnostics.Debug.WriteLine("NotificationService: All notifications cleared");
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"NotificationService: Error clearing notifications - {ex.Message}");
                }
            });
        }

        private void RemoveNotificationFromHost(VehicleNotification notification)
        {
            if (_notificationHost == null) return;

            var popupToRemove = _notificationHost.Children
                .OfType<NotificationPopup>()
                .FirstOrDefault(p => p.NotificationId == notification.Id);

            if (popupToRemove != null)
            {
                _notificationHost.Children.Remove(popupToRemove);
            }
        }

        private void SetupAutoCloseTimer(VehicleNotification notification)
        {
            var totalMilliseconds = notification.AutoCloseTime.TotalMilliseconds;
            var updateInterval = 50; // Update every 50ms for smooth progress
            var steps = totalMilliseconds / updateInterval;
            var progressDecrement = 100.0 / steps;

            var timer = Observable.Timer(TimeSpan.Zero, TimeSpan.FromMilliseconds(updateInterval))
                .ObserveOn(RxApp.MainThreadScheduler)
                .Subscribe(tick =>
                {
                    if (_activeNotifications.Contains(notification))
                    {
                        notification.ProgressValue -= progressDecrement;

                        if (notification.ProgressValue <= 0)
                        {
                            _ = CloseNotificationAsync(notification.Id!);
                        }
                    }
                });
        }
    }
}