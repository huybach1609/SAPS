using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.NotificationDtos
{
    public class BulkNotificationRequest
    {
        [Required]
        public List<string> UserIds { get; set; } = new();

        [Required]
        public NotificationRequest Notification { get; set; } = null!;
    }
}