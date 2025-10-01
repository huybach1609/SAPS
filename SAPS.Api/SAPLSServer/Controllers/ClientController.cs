using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using SAPLSServer.DTOs.Concrete.UserDtos;
using SAPLSServer.DTOs.Concrete.NotificationDtos;
using SAPLSServer.DTOs.PaginationDto;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;
using System.Security.Claims;

namespace SAPLSServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientController : ControllerBase
    {
        private readonly IClientService _clientService;
        // private readonly IFirebaseNotificationService _notificationService;
        private readonly ILogger<ClientController> _logger;

        public ClientController(IClientService clientService, ILogger<ClientController> logger)
        {
            _clientService = clientService;
            // _notificationService = notificationService;
            _logger = logger;
        }

        /// <summary>
        /// Registers a new client profile (Open for everyone)
        /// </summary>
        /// <param name="request">Client profile creation request</param>
        /// <returns>Success response</returns>
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> RegisterClient([FromForm] CreateClientProfileRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in RegisterClient: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                await _clientService.Create(request);
                return Ok(new { message = MessageKeys.CLIENT_PROFILE_CREATED_SUCCESSFULLY });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while registering a new client profile");
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access while registering a new client profile");
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while registering a new client profile");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Updates an existing client profile
        /// </summary>
        /// <param name="request">Client profile update request</param>
        /// <returns>Success response</returns>
        [HttpPut]
        [Authorize(Policy = Accessibility.CLIENT_ACCESS)]
        public async Task<IActionResult> UpdateClient([FromForm] UpdateClientProfileRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in UpdateClient: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogWarning("Unauthorized access attempt in UpdateClient");
                    return Unauthorized(new { message = MessageKeys.UNAUTHORIZED_ACCESS });
                }
                await _clientService.Update(request, userId);
                return Ok(new { message = MessageKeys.CLIENT_PROFILE_UPDATED_SUCCESSFULLY });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while updating client profile");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating client profile");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets client profile by user ID
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <returns>Client profile details</returns>
        [HttpGet("user/{userId}")]
        [Authorize(Policy = Accessibility.ADMIN_CLIENT_ACCESS)]
        public async Task<ActionResult<ClientProfileDetailsDto>> GetByUserId(string userId)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;
                //Check if the current user is an admin or the same user
                if (role != UserRole.Admin.ToString() && currentUserId != userId)
                {
                    _logger.LogWarning("Unauthorized access attempt in GetByUserId for UserId: {UserId}", userId);
                    return Unauthorized(new { message = MessageKeys.UNAUTHORIZED_ACCESS });
                }
                var result = await _clientService.GetByUserId(userId);
                if (result == null)
                {
                    _logger.LogInformation("Client profile not found for UserId: {UserId}", userId);
                    return NotFound(new { message = MessageKeys.CLIENT_PROFILE_NOT_FOUND });
                }

                return Ok(result);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while retrieving client profile with UserId: {UserId}", userId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving client profile with UserId: {UserId}", userId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets paginated list of client profiles
        /// </summary>
        /// <param name="pageRequest">Pagination parameters</param>
        /// <param name="request">Filter criteria</param>
        /// <returns>Paginated client profiles</returns>
        [HttpGet("page")]
        [Authorize(Policy = Accessibility.ADMIN_ACCESS)]
        public async Task<ActionResult<PageResult<ClientProfileSummaryDto>>> GetClientProfilesPage([FromQuery] PageRequest pageRequest, [FromQuery] GetClientListRequest request)
        {
            try
            {
                var result = await _clientService.GetClientProfilesPage(pageRequest, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving paginated client profiles");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Registers a device token for push notifications for the current user
        /// </summary>
        /// <param name="request">Device token registration request</param>
        /// <returns>Success response</returns>
        [HttpPost("register-device-token")]
        [Authorize(Policy = Accessibility.CLIENT_ACCESS)]
        public async Task<ActionResult> RegisterDeviceToken([FromBody] RegisterDeviceTokenRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in RegisterDeviceToken: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                // if (!_notificationService.ValidateDeviceToken(request.DeviceToken))
                // {
                //     _logger.LogWarning("Invalid device token format in RegisterDeviceToken: {DeviceToken}", request.DeviceToken);
                //     return BadRequest(new { message = "Invalid device token format" });
                // }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogWarning("Unauthorized access attempt in RegisterDeviceToken");
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                await _clientService.UpdateDeviceToken(userId, request.DeviceToken);

                return Ok(new { message = "Device token registered successfully" });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while registering device token");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while registering device token");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Unregisters the device token for the current user (clears notifications)
        /// </summary>
        /// <returns>Success response</returns>
        [HttpPost("unregister-device-token")]
        [Authorize(Policy = Accessibility.CLIENT_ACCESS)]
        public async Task<ActionResult> UnregisterDeviceToken()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogWarning("Unauthorized access attempt in UnregisterDeviceToken");
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                await _clientService.UpdateDeviceToken(userId, null);

                return Ok(new { message = "Device token unregistered successfully" });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while unregistering device token");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while unregistering device token");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Verifies and updates the client profile with citizen card images and information.
        /// </summary>
        /// <param name="request">Verification request containing images and client info</param>
        /// <returns>Success response</returns>
        [HttpPost("verify-lvl-2")]
        [Authorize(Policy = Accessibility.CLIENT_ACCESS)]
        public async Task<IActionResult> VerifyClient([FromForm] VerifyLevelTwoClientRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in VerifyClient: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogWarning("Unauthorized access attempt in VerifyClient");
                    return Unauthorized(new { message = MessageKeys.UNAUTHORIZED_ACCESS });
                }

                await _clientService.VerifyLevelTwo(request, userId);
                return Ok(new { message = MessageKeys.CLIENT_VERIFIED_SUCCESSFULLY });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while verifying client profile");
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access while verifying client profile");
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while verifying client profile");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Checks if the current client has completed level two verification.
        /// </summary>
        /// <returns>True if the client is verified at level two, otherwise false.</returns>
        [HttpGet("is-verify-level-two")]
        [Authorize(Policy = Accessibility.CLIENT_ACCESS)]
        public async Task<IActionResult> IsVerifyLevelTwo()
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogWarning("Unauthorized access attempt in IsVerifyLevelTwo");
                    return Unauthorized(new { message = MessageKeys.UNAUTHORIZED_ACCESS });
                }

                var isVerified = await _clientService.IsVerifyLevelTwo(userId);
                return Ok(new { isVerified });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking level two verification status");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Retrieves a client profile summary by the provided vehicle share code.
        /// </summary>
        /// <param name="shareCode">The unique share code associated with the client.</param>
        /// <returns>The client profile summary if found; otherwise, NotFound.</returns>
        [HttpGet("by-share-code/{shareCode}")]
        [Authorize(Policy = Accessibility.ADMIN_CLIENT_ACCESS)]
        public async Task<IActionResult> GetUserIdByShareCode(string shareCode)
        {
            try
            {
                var result = await _clientService.GetUserIdByShareCode(shareCode);
                return Ok(result);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid share code provided: {ShareCode}", shareCode);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving client profile by share code: {ShareCode}", shareCode);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Retrieves a list of client profiles based on the provided request criteria.
        /// </summary>
        /// <param name="request">The request containing filter and pagination information.</param>
        /// <returns>A list of client profiles that match the criteria.</returns>
        [HttpGet]
        [Authorize(Policy = Accessibility.ADMIN_ACCESS)]
        public async Task<ActionResult<List<ClientProfileSummaryDto>>> GetListClients([FromQuery] GetClientListRequest request)
        {
            try
            {
                var result = await _clientService.GetClientProfiles(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving list of client profiles");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }
    }
}