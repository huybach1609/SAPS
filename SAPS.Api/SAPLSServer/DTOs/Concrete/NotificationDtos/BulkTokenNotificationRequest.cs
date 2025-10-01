using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.NotificationDtos
{
    public class BulkTokenNotificationRequest
    {
        [Required]
        public List<string> DeviceTokens { get; set; } = new();

        [Required]
        public NotificationRequest Notification { get; set; } = null!;
    }
}