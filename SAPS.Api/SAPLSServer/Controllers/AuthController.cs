using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.UserDtos;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;
using System.Security.Authentication;
using System.Security.Claims;

namespace SAPLSServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, IConfiguration configuration, ILogger<AuthController> logger)
        {
            _authService = authService;
            _configuration = configuration;
            _logger = logger;
        }

        /// <summary>
        /// Authenticates a user with email and password
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult<AuthenticateUserResponse>> AuthenticateUser([FromBody] AuthenticateUserRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in AuthenticateUser: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _authService.AuthenticateAdminAndParkingLotOwner(request);

                if (result == null)
                {
                    _logger.LogInformation("Authentication failed for user: {Email}", request.Email);
                    return Unauthorized(new { message = MessageKeys.INVALID_CREDENTIALS });
                }

                return Ok(result);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided during user authentication");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during user authentication");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = MessageKeys.AUTHENTICATION_FAILED });
            }
        }

        /// <summary>
        /// Authenticates a staff member with email and password
        /// </summary>
        [HttpPost("staff/login")]
        public async Task<ActionResult<AuthenticateUserResponse>> AuthenticateStaff([FromBody] AuthenticateUserRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in AuthenticateStaff: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _authService.AuthenticateStaff(request);

                if (result == null)
                {
                    _logger.LogInformation("Authentication failed for staff: {Email}", request.Email);
                    return Unauthorized(new { message = MessageKeys.INVALID_CREDENTIALS });
                }

                return Ok(result);
            }
            catch (InvalidCredentialException ex)
            {
                _logger.LogWarning(ex, "Invalid credentials provided during staff authentication");
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided during staff authentication");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during staff authentication");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = MessageKeys.AUTHENTICATION_FAILED });
            }
        }

        /// <summary>
        /// Authenticates a client profile with email/citizen ID and password
        /// </summary>
        [HttpPost("client/login")]
        public async Task<ActionResult<AuthenticateUserResponse>> AuthenticateClientProfile([FromBody] AuthenticateClientProfileRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in AuthenticateClientProfile: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _authService.AuthenticateClientProfile(request);

                if (result == null)
                {
                    _logger.LogInformation("Authentication failed for client profile: {EmailOrCitizenIdNo}", request.EmailOrCitizenIdNo);
                    return Unauthorized(new { message = MessageKeys.INVALID_CREDENTIALS });
                }

                return Ok(result);
            }
            catch (InvalidCredentialException ex)
            {
                _logger.LogWarning(ex, "Invalid credentials provided during client profile authentication");
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided during client profile authentication");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during client profile authentication");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = MessageKeys.AUTHENTICATION_FAILED });
            }
        }

        /// <summary>
        /// Initiates Google OAuth authentication flow - redirects user to Google sign-in
        /// </summary>
        [HttpGet("google-login")]
        public IActionResult GoogleLogin(string? returnUrl = null)
        {
            // No exception expected here, so no logger needed.
            var redirectUrl = Url.Action(nameof(GoogleCallback), "Auth", new { returnUrl });
            var properties = new AuthenticationProperties
            {
                RedirectUri = redirectUrl,
                Items =
                {
                    { "returnUrl", returnUrl ?? "/" }
                }
            };

            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        /// <summary>
        /// Handles Google OAuth callback and processes authentication for existing users only
        /// </summary>
        [HttpGet("google-callback")]
        public async Task<IActionResult> GoogleCallback(string? returnUrl = null)
        {
            try
            {
                var authenticateResult = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);

                if (!authenticateResult.Succeeded)
                {
                    _logger.LogWarning("Google authentication failed in callback.");
                    return RedirectToFrontend($"/login?error={MessageKeys.GOOGLE_AUTH_FAILED}");
                }

                var claims = authenticateResult.Principal?.Claims;
                var googleId = claims?.FirstOrDefault(c => c.Type == "google_id")?.Value;
                var email = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

                if (string.IsNullOrWhiteSpace(googleId) || string.IsNullOrWhiteSpace(email))
                {
                    _logger.LogWarning("Missing user info in Google callback. GoogleId: {GoogleId}, Email: {Email}", googleId, email);
                    return RedirectToFrontend($"/login?error={MessageKeys.MISSING_USER_INFO}");
                }

                var googleAuthRequest = new GoogleAuthRequest
                {
                    AccessToken = googleId
                };

                var result = await _authService.AuthenticateWithGoogle(googleAuthRequest);

                if (result == null)
                {
                    _logger.LogInformation("Google user not found for GoogleId: {GoogleId}, Email: {Email}", googleId, email);
                    return RedirectToFrontend($"/login?error={MessageKeys.USER_NOT_FOUND}");
                }

                var frontendUrl = GetFrontendUrl();
                var redirectWithToken = $"{frontendUrl}/auth/callback?token={result.AccessToken}&refreshToken={result.RefreshToken}&expiresAt={result.ExpiresAt:O}";

                return Redirect(redirectWithToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during Google OAuth callback processing");
                return RedirectToFrontend($"/login?error={MessageKeys.AUTHENTICATION_ERROR}");
            }
        }

        /// <summary>
        /// For mobile/desktop apps - authenticate with Google ID token for existing users only
        /// </summary>
        [HttpPost("google")]
        public async Task<ActionResult<AuthenticateUserResponse>> AuthenticateWithGoogleToken([FromBody] GoogleAuthRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in AuthenticateWithGoogleToken: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                if (string.IsNullOrWhiteSpace(request?.AccessToken))
                {
                    _logger.LogWarning("Access token is required for Google authentication.");
                    return BadRequest(new { message = MessageKeys.ACCESS_TOKEN_REQUIRED });
                }

                var result = await _authService.AuthenticateWithGoogle(request);

                if (result == null)
                {
                    _logger.LogInformation("Invalid Google token or user not found for Google authentication.");
                    return BadRequest(new { message = MessageKeys.INVALID_GOOGLE_TOKEN_OR_USER_NOT_FOUND });
                }

                return Ok(result);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided during Google token authentication");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during Google token authentication");
                return StatusCode(500, new { message = MessageKeys.AUTHENTICATION_FAILED });
            }
        }

        /// <summary>
        /// Sign out from Google OAuth specifically
        /// </summary>
        [HttpPost("google-logout")]
        [Authorize]
        public async Task<IActionResult> GoogleLogout()
        {
            try
            {
                await HttpContext.SignOutAsync(GoogleDefaults.AuthenticationScheme);
                ClearAuthCookies();
                return Ok(new { message = MessageKeys.LOGGED_OUT_FROM_GOOGLE_SUCCESSFULLY });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during Google logout");
                return StatusCode(500, new { message = MessageKeys.GOOGLE_LOGOUT_FAILED });
            }
        }

        /// <summary>
        /// Refreshes the access token using a valid refresh token
        /// </summary>
        [HttpPost("refresh-token")]
        public async Task<ActionResult<AuthenticateUserResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in RefreshToken: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

                var result = await _authService.RefreshToken(currentUserId, request);

                if (result == null)
                {
                    _logger.LogInformation("Invalid refresh token for user: {UserId}", currentUserId);
                    return Unauthorized(new { message = MessageKeys.INVALID_REFRESH_TOKEN });
                }

                return Ok(result);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided during token refresh");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during token refresh");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = MessageKeys.TOKEN_REFRESH_FAILED });
            }
        }

        #region Private Helper Methods

        private string GetFrontendUrl()
        {
            var isDevelopment = HttpContext.RequestServices
                .GetRequiredService<IWebHostEnvironment>()
                .IsDevelopment();

            return isDevelopment
                ? _configuration["Urls:Frontend:Development"] ?? "http://localhost:3000"
                : _configuration["Urls:Frontend:Production"] ?? "https://yourdomain.com";
        }

        private IActionResult RedirectToFrontend(string path)
        {
            var frontendUrl = GetFrontendUrl();
            return Redirect($"{frontendUrl}{path}");
        }

        private void ClearAuthCookies()
        {
            Response.Cookies.Delete("access_token");
            Response.Cookies.Delete("refresh_token");
        }

        #endregion
    }
}