using System.ComponentModel.DataAnnotations;

namespace SAPLDesktopApp.DTOs.Concrete.UserDtos
{
    public class RefreshTokenRequest
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }
}