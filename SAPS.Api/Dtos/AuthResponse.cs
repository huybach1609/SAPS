using SAPS.Api.Models.Generated;

namespace SAPS.Api.Dtos
{
    public class AuthResponse
    {
        public string AccessToken { get; set; } = null!;
        public UserResponseDto User { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
    }
}
