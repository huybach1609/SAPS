using System.Security.Claims;
using System.Threading.Tasks;
using Google.Apis.Upload;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SAPS.Api.Dtos;
using SAPS.Api.Models;
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
        public AuthController(AuthService authService, IUserRepository userRepo, GoogleAuthService googleAuthService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _userRepo = userRepo;
            _googleAuthService = googleAuthService;
            _logger = logger;
        }
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] UserLoginDto login)
        {
            var resutl = await _authService.Login(login);
            if (resutl.User == null)
            {
                return Unauthorized("Invalid username or password");
            }
            return Ok(resutl);
        }
        //[HttpPost("google/verify")]
        //public async Task<IActionResult> VerifyGoogleToken([FromBody] GoogleTokenRequest request)
        //{
        //    try
        //    {
        //        if (string.IsNullOrEmpty(request.IdToken))
        //        {
        //            return BadRequest("ID token is required");
        //        }

        //        // Verify Google ID token
        //        var payload = await _googleAuthService.VerifyGoogleTokenAsync(request.IdToken);

        //        if (payload == null)
        //        {
        //            return Unauthorized("Invalid Google token");
        //        }

        //        // Create or update user
        //        var user = await _googleAuthService.CreateOrUpdateUserAsync(payload);

        //        // Generate JWT token
        //        var jwtToken = _googleAuthService.GenerateJwtToken(user);
        //        Console.WriteLine(jwtToken);

        //        var response = new AuthResponse
        //        {
        //            AccessToken = jwtToken,
        //            User = user,
        //            ExpiresAt = DateTime.UtcNow.AddHours(24)
        //        };

        //        return Ok(response);
        //    }
        //    catch (Exception ex)
        //    {s
        //        return StatusCode(500, $"Internal server error: {ex.Message}");
        //    }
        //}
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

                // Verify Google ID token
                var payload = await _googleAuthService.VerifyGoogleTokenAsync(request.IdToken);
                if (payload == null)
                {
                    _logger.LogWarning("Google token verification failed");
                    return Unauthorized("Invalid Google token");
                }

                _logger.LogInformation("Google token verified for user: {Email}", payload.Email);

                // Create or update user
                var user = await _googleAuthService.CreateOrUpdateUserAsync(payload);
                _logger.LogInformation("User created/updated: {UserId}", user.UserId);

                // Generate JWT token
                var jwtToken = _googleAuthService.GenerateJwtToken(user);
                _logger.LogInformation("JWT token generated successfully");

                var response = new AuthResponse
                {
                    AccessToken = jwtToken,
                    User = user,
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
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var user = await _userRepo.GetByIdAsync(userId);

                if (user == null)
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
