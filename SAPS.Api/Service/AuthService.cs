using AutoMapper;
using SAPS.Api.Dtos;
using SAPS.Api.Models.Generated;
using SAPS.Api.Repository;

namespace SAPS.Api.Service
{
    public class AuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly JwtService _jwtService;
        private readonly IMapper _mapper;
        
        public AuthService(IUserRepository userRepository, JwtService jwtService, IMapper mapper)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
            _mapper = mapper;
        }

        public async Task<AuthResponse> Login(UserLoginDto dto)
        {
            var existingUser = await _userRepository.GetByUsernameAsync(dto.UserName);
            if (existingUser == null)
            {
                return new AuthResponse
                {
                    User = null!,
                    AccessToken = null!
                };
            }
            
            if (dto.Password.Equals(existingUser.Password))
            {
                var token = _jwtService.GenerateToken(existingUser);
                
                // Map User entity to UserResponseDto to avoid circular references
                var userDto = _mapper.Map<UserResponseDto>(existingUser);
                
                return new AuthResponse
                {
                    AccessToken = token,
                    User = userDto,
                    ExpiresAt = DateTime.UtcNow.AddHours(24)
                };
            }

            return new AuthResponse
            {
                User = null!,
                AccessToken = null!
            };
        }
    }
}
