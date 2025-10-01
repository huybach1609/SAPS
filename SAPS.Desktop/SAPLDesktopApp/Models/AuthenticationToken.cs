using System;

namespace SAPLDesktopApp.Models
{
    public class AuthenticationToken
    {
        public string AccessToken { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
        public string TokenType { get; set; } = "Bearer";
        public DateTime ExpiresAt { get; set; }
        
        // Helper properties
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        public string AuthorizationHeader => $"{TokenType} {AccessToken}";
        public TimeSpan TimeUntilExpiry => ExpiresAt - DateTime.UtcNow;
    }
}