using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.UserDtos;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;
using System.Security.Claims;

namespace SAPLSServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UserController> _logger;

        public UserController(IUserService userService, ILogger<UserController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        /// <summary>
        /// Gets user details by user ID
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <returns>User details</returns>
        [HttpGet("{userId}")]
        [Authorize]
        public async Task<ActionResult<UserDetailsDto>> GetUserById(string userId)
        {
            try
            {
                var result = await _userService.GetById(userId);
                if (result == null)
                {
                    _logger.LogInformation("User not found for UserId: {UserId}", userId);
                    return NotFound(new { message = MessageKeys.USER_NOT_FOUND });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving user by UserId: {UserId}", userId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets user details by phone or email
        /// </summary>
        /// <param name="phoneOrEmail">Phone number or email address</param>
        /// <returns>User details</returns>
        [HttpGet("search/{phoneOrEmail}")]
        [Authorize(Policy = Accessibility.ADMIN_PARKINGLOT_OWNER_ACCESS)]
        public async Task<ActionResult<UserDetailsDto>> GetUserByPhoneOrEmail(string phoneOrEmail)
        {
            try
            {
                var result = await _userService.GetByPhoneOrEmail(phoneOrEmail);
                if (result == null)
                {
                    _logger.LogInformation("User not found for PhoneOrEmail: {PhoneOrEmail}", phoneOrEmail);
                    return NotFound(new { message = MessageKeys.USER_NOT_FOUND });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving user by PhoneOrEmail: {PhoneOrEmail}", phoneOrEmail);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Updates user profile image
        /// </summary>
        /// <param name="request">Profile image update request</param>
        /// <returns>Success response</returns>
        [HttpPut("profile-image")]
        [Authorize]
        public async Task<IActionResult> UpdateProfileImage([FromForm] UpdateUserProfileImageRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in UpdateProfileImage: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                // Ensure user can only update their own profile or admin can update any
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                if (currentUserId != request.Id &&
                    userRole != UserRole.Admin.ToString())
                {
                    _logger.LogWarning("Unauthorized access attempt in UpdateProfileImage by UserId: {UserId}", currentUserId);
                    return StatusCode(403, new { message = MessageKeys.UNAUTHORIZED_ACCESS });
                }

                await _userService.UpdateProfileImage(request);
                return Ok(new { message = MessageKeys.PROFILE_IMAGE_UPDATED_SUCCESSFULLY });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while updating profile image for UserId: {UserId}", request.Id);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating profile image for UserId: {UserId}", request.Id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Updates user status (Admin only)
        /// </summary>
        /// <param name="request">Status update request</param>
        /// <returns>Success response</returns>
        [HttpPut("status")]
        [Authorize(Policy = Accessibility.HEAD_ADMIN_ACCESS)]
        public async Task<IActionResult> UpdateUserStatus([FromBody] UpdateUserStatusRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in UpdateUserStatus: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                await _userService.UpdateStatus(request);
                return Ok(new { message = MessageKeys.USER_UPDATED_SUCCESSFULLY });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while updating user status for UserId: {UserId}", request.Id);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating user status for UserId: {UserId}", request.Id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }
    }
}