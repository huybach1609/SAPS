using SAPLSServer.DTOs.Concrete.NotificationDtos;

namespace SAPLSServer.Services.Interfaces
{
    /// <summary>
    /// Service for sending push notifications via Firebase Cloud Messaging
    /// </summary>
    public interface IFirebaseNotificationService
    {
        /// <summary>
        /// Sends a notification to a specific device token
        /// </summary>
        /// <param name="deviceToken">The FCM device token</param>
        /// <param name="notification">The notification content</param>
        /// <returns>Notification response with result details</returns>
        Task<NotificationResponse> SendNotificationToTokenAsync(string deviceToken, NotificationRequest notification);

        /// <summary>
        /// Sends a notification to multiple device tokens
        /// </summary>
        /// <param name="deviceTokens">List of FCM device tokens</param>
        /// <param name="notification">The notification content</param>
        /// <returns>Notification response with batch result details</returns>
        Task<NotificationResponse> SendBulkNotificationToTokensAsync(List<string> deviceTokens, NotificationRequest notification);

        /// <summary>
        /// Sends a notification to a topic (all users subscribed to that topic)
        /// </summary>
        /// <param name="topic">The topic name</param>
        /// <param name="notification">The notification content</param>
        /// <returns>Notification response with result details</returns>
        Task<NotificationResponse> SendNotificationToTopicAsync(string topic, NotificationRequest notification);

        /// <summary>
        /// Subscribes a device token to a topic
        /// </summary>
        /// <param name="deviceToken">The FCM device token</param>
        /// <param name="topic">The topic name</param>
        /// <returns>True if successful</returns>
        Task<bool> SubscribeToTopicAsync(string deviceToken, string topic);

        /// <summary>
        /// Unsubscribes a device token from a topic
        /// </summary>
        /// <param name="deviceToken">The FCM device token</param>
        /// <param name="topic">The topic name</param>
        /// <returns>True if successful</returns>
        Task<bool> UnsubscribeFromTopicAsync(string deviceToken, string topic);

        /// <summary>
        /// Validates if a device token has correct format
        /// </summary>
        /// <param name="deviceToken">The FCM device token</param>
        /// <returns>True if valid format</returns>
        bool ValidateDeviceToken(string deviceToken);
    }
}