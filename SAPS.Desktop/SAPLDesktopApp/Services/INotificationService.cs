using Avalonia.Controls;
using SAPLDesktopApp.Models;
using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    /// <summary>
    /// Service for managing notification popups
    /// </summary>
    public interface INotificationService
    {
        /// <summary>
        /// Show a notification popup
        /// </summary>
        /// <param name="title">Notification title</param>
        /// <param name="message">Notification message</param>
        /// <param name="licensePlate">License plate (optional)</param>
        /// <param name="type">Notification type</param>
        /// <param name="autoCloseTime">Auto-close duration (default: 5 seconds)</param>
        Task ShowNotificationAsync(string title, string message, string licensePlate = "", NotificationType type = NotificationType.Info, TimeSpan? autoCloseTime = null);

        /// <summary>
        /// Show a check-in notification
        /// </summary>
        /// <param name="licensePlate">License plate</param>
        /// <param name="message">Additional message</param>
        Task ShowCheckInNotificationAsync(string licensePlate, string message = "Successfully checked in");

        /// <summary>
        /// Show a check-out notification
        /// </summary>
        /// <param name="licensePlate">License plate</param>
        /// <param name="message">Additional message</param>
        Task ShowCheckOutNotificationAsync(string licensePlate, string message = "Successfully checked out");

        /// <summary>
        /// Show an error notification
        /// </summary>
        /// <param name="title">Error title</param>
        /// <param name="message">Error message</param>
        Task ShowErrorNotificationAsync(string title, string message);

        /// <summary>
        /// Show a warning notification
        /// </summary>
        /// <param name="title">Warning title</param>
        /// <param name="message">Warning message</param>
        Task ShowWarningNotificationAsync(string title, string message);

        /// <summary>
        /// Show an info notification
        /// </summary>
        /// <param name="title">Info title</param>
        /// <param name="message">Info message</param>
        Task ShowInfoNotificationAsync(string title, string message);

        /// <summary>
        /// Close a specific notification
        /// </summary>
        /// <param name="notificationId">Notification ID to close</param>
        Task CloseNotificationAsync(string notificationId);

        /// <summary>
        /// Clear all visible notifications
        /// </summary>
        Task ClearAllNotificationsAsync();

        /// <summary>
        /// Initialize the notification host with the container
        /// </summary>
        /// <param name="notificationHost">The notification host panel from MainWindow</param>
        void Initialize(Panel notificationHost);

        /// <summary>
        /// Get current active notifications
        /// </summary>
        ObservableCollection<VehicleNotification> ActiveNotifications { get; }

        /// <summary>
        /// Whether there are active notifications
        /// </summary>
        bool HasActiveNotifications { get; }
    }
}