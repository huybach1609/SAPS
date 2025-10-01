using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.NotificationDtos
{
    public class NotificationRequest
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Body { get; set; } = string.Empty;

        public Dictionary<string, string>? Data { get; set; }

        public string? ImageUrl { get; set; }

        public string? Sound { get; set; }

        public string? Icon { get; set; }

        public string? ClickAction { get; set; }
    }
}