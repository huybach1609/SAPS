using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.NotificationDtos
{
    public class SendNotificationRequest
    {
        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public NotificationRequest Notification { get; set; } = null!;
    }
}