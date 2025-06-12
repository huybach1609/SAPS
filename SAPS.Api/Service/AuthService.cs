
using SAPS.Api.Dtos;
using SAPS.Api.Repository;

namespace SAPS.Api.Service
{
    public class AuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly JwtService _jwtService;
        public AuthService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<AuthResponse> Login(UserLoginDto dto)
        {
            var existingUser = await _userRepository.GetByUsernameAsync(dto.UserName);
            if (existingUser == null)
            {
                return new AuthResponse
                {
                    User = null,
                };
            }
            if (dto.Password.Equals(existingUser.Password))
            {
                var token = _jwtService.GenerateToken(existingUser);
                return new AuthResponse
                {
                    AccessToken = token,
                    User = existingUser,
                    ExpiresAt = DateTime.UtcNow.AddHours(24)
                };
            }

            return new AuthResponse
            {
                User = null,
            };

        }
    }
}
