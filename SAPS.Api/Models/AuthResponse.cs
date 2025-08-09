using SAPS.Api.Models.Generated;

namespace SAPS.Api.Models
{
    public class AuthResponse
    {
        public string AccessToken { get; set; } = null!;
        public User User { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
    }
}