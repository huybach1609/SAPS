using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.NotificationDtos
{
    public class RegisterDeviceTokenRequest
    {
        [Required]
        public string DeviceToken { get; set; } = string.Empty;
    }
}