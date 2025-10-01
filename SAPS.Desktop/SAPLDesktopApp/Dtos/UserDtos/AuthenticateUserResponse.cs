using System;

namespace SAPLDesktopApp.DTOs.Concrete.UserDtos
{
    public class AuthenticateUserResponse
    {
        public string AccessToken { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
        public string TokenType { get; set; } = "Bearer";
        public DateTime ExpiresAt { get; set; }
    }
}
