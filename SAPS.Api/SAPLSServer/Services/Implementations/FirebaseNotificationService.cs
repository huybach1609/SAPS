using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.NotificationDtos;
using SAPLSServer.Services.Interfaces;

namespace SAPLSServer.Services.Implementations
{
    public class FirebaseNotificationService : IFirebaseNotificationService
    {
        private readonly IFirebaseSettings _firebaseSettings;
        private readonly FirebaseApp _firebaseApp;

        public FirebaseNotificationService(
            IFirebaseSettings firebaseSettings)
        {
            _firebaseSettings = firebaseSettings;

            // Initialize Firebase App if not already initialized
            if (FirebaseApp.DefaultInstance == null)
            {
                _firebaseApp = FirebaseApp.Create(new AppOptions()
                {
                    Credential = GoogleCredential.FromJson(_firebaseSettings.ServiceAccountJson),
                    ProjectId = _firebaseSettings.ProjectId
                });
            }
            else
            {
                _firebaseApp = FirebaseApp.DefaultInstance;
            }
        }

        // Remove user-based methods since tokens are stored on client
        public async Task<NotificationResponse> SendNotificationToTokenAsync(string deviceToken, NotificationRequest notification)
        {
            try
            {
                var message = CreateFirebaseMessage(deviceToken, notification);
                var response = await FirebaseMessaging.DefaultInstance.SendAsync(message);

                return new NotificationResponse
                {
                    IsSuccess = true,
                    MessageId = response,
                    SuccessCount = 1
                };
            }
            catch (Exception ex)
            {
                return new NotificationResponse
                {
                    IsSuccess = false,
                    ErrorMessage = ex.Message,
                    FailureCount = 1,
                    FailedTokens = new List<string> { deviceToken }
                };
            }
        }

        public async Task<NotificationResponse> SendBulkNotificationToTokensAsync(List<string> deviceTokens, NotificationRequest notification)
        {
            try
            {
                if (!deviceTokens.Any())
                {
                    return new NotificationResponse
                    {
                        IsSuccess = false,
                        ErrorMessage = "No device tokens provided"
                    };
                }

                var messages = deviceTokens.Select(token => CreateFirebaseMessage(token, notification)).ToList();
                var response = await FirebaseMessaging.DefaultInstance.SendEachAsync(messages);

                var failedTokens = new List<string>();
                for (int i = 0; i < response.Responses.Count; i++)
                {
                    if (!response.Responses[i].IsSuccess)
                    {
                        failedTokens.Add(deviceTokens[i]);
                    }
                }

                return new NotificationResponse
                {
                    IsSuccess = response.SuccessCount > 0,
                    SuccessCount = response.SuccessCount,
                    FailureCount = response.FailureCount,
                    FailedTokens = failedTokens
                };
            }
            catch (Exception ex)
            {
                return new NotificationResponse
                {
                    IsSuccess = false,
                    ErrorMessage = ex.Message,
                    FailureCount = deviceTokens.Count,
                    FailedTokens = deviceTokens
                };
            }
        }

        public async Task<NotificationResponse> SendNotificationToTopicAsync(string topic, NotificationRequest notification)
        {
            try
            {
                var message = new Message()
                {
                    Notification = new Notification
                    {
                        Title = notification.Title,
                        Body = notification.Body,
                        ImageUrl = notification.ImageUrl
                    },
                    Topic = topic,
                    Data = notification.Data
                };

                var response = await FirebaseMessaging.DefaultInstance.SendAsync(message);

                return new NotificationResponse
                {
                    IsSuccess = true,
                    MessageId = response
                };
            }
            catch (Exception ex)
            {
                return new NotificationResponse
                {
                    IsSuccess = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        public async Task<bool> SubscribeToTopicAsync(string deviceToken, string topic)
        {
            try
            {
                await FirebaseMessaging.DefaultInstance.SubscribeToTopicAsync(new List<string> { deviceToken }, topic);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> UnsubscribeFromTopicAsync(string deviceToken, string topic)
        {
            try
            {
                await FirebaseMessaging.DefaultInstance.UnsubscribeFromTopicAsync(new List<string> { deviceToken }, topic);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        // Utility method to validate token format (optional)
        public bool ValidateDeviceToken(string deviceToken)
        {
            try
            {
                // Basic validation - FCM tokens are usually 163 characters long
                return !string.IsNullOrWhiteSpace(deviceToken) && deviceToken.Length > 100;
            }
            catch
            {
                return false;
            }
        }

        private Message CreateFirebaseMessage(string deviceToken, NotificationRequest notification)
        {
            return new Message()
            {
                Token = deviceToken,
                Notification = new Notification
                {
                    Title = notification.Title,
                    Body = notification.Body,
                    ImageUrl = notification.ImageUrl
                },
                Data = notification.Data,
                Android = new AndroidConfig
                {
                    Notification = new AndroidNotification
                    {
                        Sound = notification.Sound ?? _firebaseSettings.DefaultSound,
                        Icon = notification.Icon ?? _firebaseSettings.DefaultIcon,
                        ClickAction = notification.ClickAction
                    }
                }
            };
        }
    }
}