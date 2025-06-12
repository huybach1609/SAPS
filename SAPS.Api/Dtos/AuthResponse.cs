
using SAPS.Api.Models;

namespace SAPS.Api.Dtos
{
    public class AuthResponse
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public User User { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
