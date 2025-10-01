
namespace SAPLDesktopApp.DTOs.Concrete.UserDtos
{
    public class AuthenticateUserRequest
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
        public bool RememberMe { get; set; } = false;
    }
}
