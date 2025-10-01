
namespace SAPLDesktopApp.DTOs.Concrete.UserDtos
{
    public class ResetUserPasswordRequest
    {
        public string? UserId { get; set; }
        public string? Otp { get; set; }
        public string? NewPassword { get; set; }
    }
}
