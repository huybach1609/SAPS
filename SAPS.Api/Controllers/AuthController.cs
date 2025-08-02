using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAPS.Api.Dtos;
using SAPS.Api.Models.Generated;
using SAPS.Api.Repository;
using SAPS.Api.Service;

namespace SAPS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ILogger<AuthController> _logger;
        private readonly AuthService _authService;
        private readonly GoogleAuthService _googleAuthService;
        private readonly IUserRepository _userRepo;
        private readonly IMapper _mapper;

        public AuthController(
            AuthService authService, 
            IUserRepository userRepo, 
            GoogleAuthService googleAuthService, 
            IMapper mapper,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _userRepo = userRepo;
            _googleAuthService = googleAuthService;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] UserLoginDto login)
        {
            var result = await _authService.Login(login);
            if (result.User == null)
            {
                return Unauthorized("Invalid username or password");
            }
            return Ok(result);
        }

        [HttpPost("google/verify")]
        public async Task<IActionResult> VerifyGoogleToken([FromBody] GoogleTokenRequest request)
        {
            try
            {
                _logger.LogInformation("Received Google token verification request");

                if (string.IsNullOrEmpty(request.IdToken))
                {
                    _logger.LogWarning("ID token is missing");
                    return BadRequest("ID token is required");
                }

                // Xác thực Google ID token
                var payload = await _googleAuthService.VerifyGoogleTokenAsync(request.IdToken);
                if (payload == null)
                {
                    _logger.LogWarning("Google token verification failed");
                    return Unauthorized("Invalid Google token");
                }

                _logger.LogInformation("Google token verified for user: {Email}", payload.Email);

                // Tạo hoặc cập nhật người dùng
                var user = await _googleAuthService.CreateOrUpdateUserAsync(payload);
                _logger.LogInformation("User created/updated: {UserId}", user.Id);

                // Map User entity to UserResponseDto to avoid circular references
                var userDto = _mapper.Map<UserResponseDto>(user);

                // Tạo JWT token
                var jwtToken = _googleAuthService.GenerateJwtToken(user);
                _logger.LogInformation("JWT token generated successfully");

                var response = new AuthResponse
                {
                    AccessToken = jwtToken,
                    User = userDto,
                    ExpiresAt = DateTime.UtcNow.AddHours(24)
                };

                _logger.LogInformation("Returning successful auth response");
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Google token verification");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("refresh")]
        [Authorize]
        public async Task<IActionResult> RefreshToken()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("Invalid token");
                }

                var user = await _userRepo.GetByIdAsync(userId);

                if (user == null || !user.IsActive)
                {
                    return Unauthorized("User not found or inactive");
                }

                var newToken = _googleAuthService.GenerateJwtToken(user);

                return Ok(new { AccessToken = newToken, ExpiresAt = DateTime.UtcNow.AddHours(24) });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
