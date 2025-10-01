using Microsoft.AspNetCore.Mvc;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.UserDtos;
using SAPLSServer.Services.Interfaces;

namespace SAPLSServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmailConfirmationController : ControllerBase
    {
        private readonly IOtpService _otpService;
        private readonly IUserService _userService;
        private readonly ILogger<EmailConfirmationController> _logger;
        public EmailConfirmationController(IOtpService otpService, IUserService userService, ILogger<EmailConfirmationController> logger)
        {
            _otpService = otpService;
            _userService = userService;
            _logger = logger;
        }

        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string otp)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(otp))
                {
                    _logger.LogWarning("ConfirmEmail called with missing userId or otp. userId: {UserId}, otp: {Otp}", userId, otp);
                    return await GetConfirmationFailureResponse();
                }

                var user = await _userService.GetById(userId);
                if (user == null)
                {
                    _logger.LogInformation("User not found during email confirmation. userId: {UserId}", userId);
                    return await GetConfirmationFailureResponse();
                }

                if (user.Status == UserStatus.Active.ToString())
                {
                    _logger.LogInformation("User already active during email confirmation. userId: {UserId}", userId);
                    return await GetConfirmationSuccessResponse();
                }

                bool isOtpValid = await _otpService.IsOtpValid(userId, otp);
                if (!isOtpValid)
                {
                    _logger.LogWarning("Invalid OTP provided for userId: {UserId}", userId);
                    return await GetConfirmationFailureResponse();
                }

                var updateStatusRequest = new UpdateUserStatusRequest
                {
                    Id = userId,
                    Status = UserStatus.Active.ToString()
                };

                await _userService.UpdateStatus(updateStatusRequest);
                _logger.LogInformation("User status updated to Active during email confirmation. userId: {UserId}", userId);

                return await GetConfirmationSuccessResponse();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while confirming email for user {UserId}", userId);
                return await GetConfirmationFailureResponse();
            }
        }

        private async Task<IActionResult> GetConfirmationSuccessResponse()
        {
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Views", "ConfirmAccountSuccessfully.html");

            if (System.IO.File.Exists(filePath))
            {
                var content = await System.IO.File.ReadAllTextAsync(filePath);
                return Content(content, "text/html");
            }

            var fallbackContent = @"
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Email Confirmed Successfully</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 50px; text-align: center; }
                        .success { color: green; }
                    </style>
                </head>
                <body>
                    <h1 class='success'>Email Confirmed Successfully!</h1>
                    <p>Your email address has been confirmed. You can now log in to your account.</p>
                    <p><a href='/login'>Go to Login</a></p>
                </body>
                </html>";

            return Content(fallbackContent, "text/html");
        }

        private async Task<IActionResult> GetConfirmationFailureResponse()
        {
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Views", "ConfirmAccountUnsuccessfully.html");

            if (System.IO.File.Exists(filePath))
            {
                var content = await System.IO.File.ReadAllTextAsync(filePath);
                return Content(content, "text/html");
            }

            var fallbackContent = @"
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Email Confirmation Failed</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 50px; text-align: center; }
                        .error { color: red; }
                    </style>
                </head>
                <body>
                    <h1 class='error'>Email Confirmation Failed</h1>
                    <p>The confirmation link is invalid or has expired.</p>
                    <p>Please request a new confirmation email or contact support.</p>
                    <p><a href='/'>Go to Home</a></p>
                </body>
                </html>";

            return Content(fallbackContent, "text/html");
        }
    }
}