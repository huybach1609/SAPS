using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using SAPLSServer.DTOs.Concrete.UserDtos;
using SAPLSServer.DTOs.PaginationDto;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;
using System.Security.Claims;

namespace SAPLSServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ParkingLotOwnerController : ControllerBase
    {
        private readonly IParkingLotOwnerService _parkingLotOwnerService;
        private readonly ILogger<ParkingLotOwnerController> _logger;

        public ParkingLotOwnerController(IParkingLotOwnerService parkingLotOwnerService, ILogger<ParkingLotOwnerController> logger)
        {
            _parkingLotOwnerService = parkingLotOwnerService;
            _logger = logger;
        }

        /// <summary>
        /// Registers a new parking lot owner profile (Only HeadAdmin can create)
        /// </summary>
        /// <param name="request">Parking lot owner profile creation request</param>
        /// <returns>Success response</returns>
        [HttpPost("register")]
        [Authorize(Policy = Accessibility.ADMIN_ACCESS)]
        public async Task<IActionResult> RegisterParkingLotOwner([FromBody] CreateParkingLotOwnerProfileRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in RegisterParkingLotOwner: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }
                var performedByAdminUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrWhiteSpace(performedByAdminUserId))
                {
                    _logger.LogWarning("Unauthorized access attempt in RegisterParkingLotOwner");
                    return Unauthorized(new { message = MessageKeys.UNAUTHORIZED_ACCESS });
                }
                await _parkingLotOwnerService.Create(request, performedByAdminUserId);
                return Ok(new { message = MessageKeys.PARKING_LOT_OWNER_PROFILE_CREATED_SUCCESSFULLY });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while registering parking lot owner profile");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while registering parking lot owner profile");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Updates an existing parking lot owner profile
        /// </summary>
        /// <param name="request">Parking lot owner profile update request</param>
        /// <returns>Success response</returns>
        [HttpPut]
        [Authorize(Policy = Accessibility.ADMIN_ACCESS)]
        public async Task<IActionResult> UpdateParkingLotOwner([FromBody] UpdateParkingLotOwnerProfileRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in UpdateParkingLotOwner: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }
                var performedByAdminUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrWhiteSpace(performedByAdminUserId))
                {
                    _logger.LogWarning("Unauthorized access attempt in UpdateParkingLotOwner");
                    return Unauthorized(new { message = MessageKeys.UNAUTHORIZED_ACCESS });
                }
                await _parkingLotOwnerService.Update(request, performedByAdminUserId);
                return Ok(new { message = MessageKeys.PARKING_LOT_OWNER_PROFILE_UPDATED_SUCCESSFULLY });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while updating parking lot owner profile");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating parking lot owner profile");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets parking lot owner profile by owner ID
        /// </summary>
        /// <param name="ownerId">Parking lot owner ID</param>
        /// <returns>Parking lot owner profile details</returns>
        [HttpGet("{ownerId}")]
        [Authorize(Policy = Accessibility.ADMIN_PARKINGLOT_OWNER_ACCESS)]
        public async Task<ActionResult<ParkingLotOwnerProfileDetailsDto>> GetByOwnerId(string ownerId)
        {
            try
            {
                var result = await _parkingLotOwnerService.GetByParkingLotOwnerId(ownerId);
                if (result == null)
                {
                    _logger.LogInformation("Parking lot owner profile not found for OwnerId: {OwnerId}", ownerId);
                    return NotFound(new { message = MessageKeys.PARKING_LOT_OWNER_PROFILE_NOT_FOUND });
                }

                return Ok(result);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while retrieving parking lot owner profile with OwnerId: {OwnerId}", ownerId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving parking lot owner profile with OwnerId: {OwnerId}", ownerId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets parking lot owner profile by user ID
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <returns>Parking lot owner profile details</returns>
        [HttpGet("user/{userId}")]
        [Authorize(Policy = Accessibility.ADMIN_PARKINGLOT_OWNER_ACCESS)]
        public async Task<ActionResult<ParkingLotOwnerProfileDetailsDto>> GetByUserId(string userId)
        {
            try
            {
                var result = await _parkingLotOwnerService.GetByUserId(userId);
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;
                // Check if the current user is an admin or the same user
                if (role != UserRole.Admin.ToString() && currentUserId != userId)
                {
                    _logger.LogWarning("Unauthorized access attempt in GetByUserId for UserId: {UserId}", userId);
                    return Unauthorized(new { message = MessageKeys.UNAUTHORIZED_ACCESS });
                }
                if (result == null)
                {
                    _logger.LogInformation("Parking lot owner profile not found for UserId: {UserId}", userId);
                    return NotFound(new { message = MessageKeys.PARKING_LOT_OWNER_PROFILE_NOT_FOUND });
                }

                return Ok(result);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while retrieving parking lot owner profile with UserId: {UserId}", userId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving parking lot owner profile with UserId: {UserId}", userId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets paginated list of parking lot owner profiles
        /// </summary>
        /// <param name="pageRequest">Pagination parameters</param>
        /// <param name="request">Filter criteria</param>
        /// <returns>Paginated parking lot owner profiles</returns>
        [HttpGet("page")]
        [Authorize(Policy = Accessibility.ADMIN_ACCESS)]
        public async Task<ActionResult<PageResult<ParkingLotOwnerProfileSummaryDto>>> GetParkingLotOwnerProfilesPage([FromQuery] PageRequest pageRequest, [FromQuery] GetParkingLotOwnerListRequest request)
        {
            try
            {
                var result = await _parkingLotOwnerService.GetParkingLotOwnerProfilesPage(pageRequest, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving paginated parking lot owner profiles");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets list of parking lot owner profiles
        /// </summary>
        /// <param name="request">Filter criteria</param>
        /// <returns>List of parking lot owner profiles</returns>
        [HttpGet]
        [Authorize(Policy = Accessibility.ADMIN_ACCESS)]
        public async Task<ActionResult<List<ParkingLotOwnerProfileSummaryDto>>> GetParkingLotOwnerProfiles([FromQuery] GetParkingLotOwnerListRequest request)
        {
            try
            {
                var result = await _parkingLotOwnerService.GetParkingLotOwnerProfiles(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving parking lot owner profiles");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }
    }
}