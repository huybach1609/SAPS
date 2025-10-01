using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.UserDtos;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SAPLSServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PasswordController : ControllerBase
    {
        private readonly IPasswordService _passwordService;
        private readonly ILogger<PasswordController> _logger;
        private readonly IOtpService _otpService;
        public PasswordController(IPasswordService passwordService, IOtpService otpService, ILogger<PasswordController> logger)
        {
            _passwordService = passwordService;
            _otpService = otpService;
            _logger = logger;
        }

        [HttpGet("reset")]
        public async Task<IActionResult> ShowResetPage([FromQuery] string userId, [FromQuery] string otp)
        {
            try
            {
                if (!await _otpService.IsOtpValid(userId, otp))
                {
                    _logger.LogWarning("Invalid OTP in ShowResetPage for userId: {UserId}", userId);
                    var invalidOtpPage = Path.Combine(Directory.GetCurrentDirectory(), "Views", "InvalidOtp.html");
                    if (!System.IO.File.Exists(invalidOtpPage))
                        return NotFound();
                    var invalidOtpPageContent = await System.IO.File.ReadAllTextAsync(invalidOtpPage);
                    return Content(invalidOtpPageContent, "text/html");
                }
                var resetPasswordPage = Path.Combine(Directory.GetCurrentDirectory(), "Views", "PasswordResetForm.html");
                if (!System.IO.File.Exists(resetPasswordPage))
                    return NotFound();
                var resetPasswordPageContent = await System.IO.File.ReadAllTextAsync(resetPasswordPage);
                resetPasswordPageContent = resetPasswordPageContent.Replace("{userId}", userId)
                                            .Replace("{otp}", otp);
                return Content(resetPasswordPageContent, "text/html");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while showing reset page for userId: {UserId}", userId);
                return StatusCode(StatusCodes.Status500InternalServerError, MessageKeys.UNEXPECTED_ERROR);
            }
        }

        [HttpGet("request/reset")]
        public async Task<IActionResult> RequestResetPassword()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                _logger.LogWarning("Unauthorized access attempt in RequestResetPassword (no userId in token)");
                return Unauthorized(MessageKeys.UNAUTHORIZED_ACCESS);
            }
            try
            {
                await _passwordService.RequestResetPassword(userId);
                return Ok(MessageKeys.RESET_PASSWORD_REQUEST_SENT_SUCCESSFULLY);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while requesting password reset for user {UserId}", userId);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while requesting password reset for user {UserId}", userId);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("request/reset/{email}")]
        public async Task<IActionResult> RequestResetPassword(string email)
        {
            try
            {
                await _passwordService.RequestResetPasswordByEmail(email);
                return Ok(MessageKeys.RESET_PASSWORD_REQUEST_SENT_SUCCESSFULLY);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while requesting password reset for email {Email}", email);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while requesting password reset for email {Email}", email);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdateUserPasswordRequest request)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state in UpdatePassword: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                _logger.LogWarning("Unauthorized access attempt in UpdatePassword (no userId in token)");
                return Unauthorized(MessageKeys.UNAUTHORIZED_ACCESS);
            }
            try
            {
                await _passwordService.UpdatePassword(userId, request);
                return Ok(MessageKeys.PASSWORD_UPDATED_SUCCESSFULLY);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while updating password for user {UserId}", userId);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating password for user {UserId}", userId);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost("reset")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetUserPasswordRequest request)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state in ResetPassword: {@ModelState}", ModelState);
                return await GetResetPasswordUnsuccessfully();
            }
            if (string.IsNullOrWhiteSpace(request.UserId) || string.IsNullOrWhiteSpace(request.Otp))
            {
                _logger.LogWarning("Missing UserId or Otp in ResetPassword request");
                return await GetResetPasswordUnsuccessfully();
            }
            try
            {
                await _passwordService.ResetPassword(request);
                return await GetResetPasswordSuccessfully();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while resetting password for user {UserId}", request.UserId);
                return await GetResetPasswordUnsuccessfully();
            }
        }

        private async Task<IActionResult> GetResetPasswordSuccessfully()
        {
            var successPage = Path.Combine(Directory.GetCurrentDirectory(), "Views", "ResetPasswordSuccessfully.html");
            if (!System.IO.File.Exists(successPage))
                return NotFound();
            var successPageContent = await System.IO.File.ReadAllTextAsync(successPage);
            return Content(successPageContent, "text/html");
        }

        private async Task<IActionResult> GetResetPasswordUnsuccessfully()
        {
            var errorPage = Path.Combine(Directory.GetCurrentDirectory(), "Views", "ResetPasswordUnsuccessfully.html");
            if (!System.IO.File.Exists(errorPage))
                return NotFound();
            var errorPageContent = await System.IO.File.ReadAllTextAsync(errorPage);
            return Content(errorPageContent, "text/html");
        }
    }
}
