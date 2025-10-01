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
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly ILogger<AdminController> _logger;
        public AdminController(IAdminService adminService, ILogger<AdminController> logger)
        {
            _adminService = adminService;
            _logger = logger;
        }

        /// <summary>
        /// Registers a new admin profile (Only HeadAdmin can create new admins)
        /// </summary>
        [HttpPost("register")]
        [Authorize(Policy = Accessibility.HEAD_ADMIN_ACCESS)]
        public async Task<IActionResult> RegisterAdmin([FromForm] CreateAdminProfileRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in RegisterAdmin: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var performedByAdminUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (performedByAdminUserId == null)
                {
                    _logger.LogWarning("Unauthorized access attempt in RegisterAdmin");
                    return Unauthorized(new { message = MessageKeys.UNAUTHORIZED_ACCESS });
                }
                await _adminService.Create(request, performedByAdminUserId);
                return Ok(new { message = MessageKeys.ADMIN_PROFILE_CREATED_SUCCESSFULLY });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while registering a new admin profile");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while registering a new admin profile");
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Updates an existing admin profile
        /// </summary>
        [HttpPut]
        [Authorize(Policy = Accessibility.HEAD_ADMIN_ACCESS)]
        public async Task<IActionResult> UpdateAdmin([FromBody] UpdateAdminProfileRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in UpdateAdmin: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var performedByAdminUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (performedByAdminUserId == null)
                {
                    _logger.LogWarning("Unauthorized access attempt in UpdateAdmin");
                    return Unauthorized(new { message = MessageKeys.UNAUTHORIZED_ACCESS });
                }
                await _adminService.Update(request, performedByAdminUserId);
                return Ok(new { message = MessageKeys.ADMIN_PROFILE_UPDATED_SUCCESSFULLY });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while updating admin profile with AdminId: {AdminId}", request.AdminId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating admin profile with AdminId: {AdminId}", request.AdminId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets admin profile by admin ID
        /// </summary>
        [HttpGet("{adminId}")]
        [Authorize(Policy = Accessibility.ADMIN_ACCESS)]
        public async Task<ActionResult<AdminProfileDetailsDto>> GetByAdminId(string adminId)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in GetByAdminId: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _adminService.GetByAdminIdAsync(adminId);
                if (result == null)
                {
                    _logger.LogInformation("Admin profile not found for AdminId: {AdminId}", adminId);
                    return NotFound(new { message = MessageKeys.ADMIN_PROFILE_NOT_FOUND });
                }

                return Ok(result);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while retrieving admin profile with AdminId: {AdminId}", adminId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving admin profile with AdminId: {AdminId}", adminId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets admin profile by user ID
        /// </summary>
        [HttpGet("user/{userId}")]
        [Authorize(Policy = Accessibility.ADMIN_ACCESS)]
        public async Task<ActionResult<AdminProfileDetailsDto>> GetByUserId(string userId)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in GetByUserId: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _adminService.GetByUserIdAsync(userId);
                if (result == null)
                {
                    _logger.LogInformation("Admin profile not found for UserId: {UserId}", userId);
                    return NotFound(new { message = MessageKeys.ADMIN_PROFILE_NOT_FOUND });
                }

                return Ok(result);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while retrieving admin profile with UserId: {UserId}", userId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving admin profile with UserId: {UserId}", userId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets paginated list of admin profiles
        /// </summary>
        [HttpGet("page")]
        [Authorize(Policy = Accessibility.ADMIN_ACCESS)]
        public async Task<ActionResult<PageResult<AdminProfileSummaryDto>>> GetAdminProfilesPage([FromQuery] PageRequest pageRequest, [FromQuery] GetAdminListRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in GetAdminProfilesPage: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _adminService.GetAdminProfilesPage(pageRequest, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving paginated admin profiles");
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets list of admin profiles
        /// </summary>
        [HttpGet]
        [Authorize(Policy = Accessibility.ADMIN_ACCESS)]
        public async Task<ActionResult<List<AdminProfileSummaryDto>>> GetAdminProfiles([FromQuery] GetAdminListRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in GetAdminProfiles: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _adminService.GetAdminProfiles(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving admin profiles");
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }
    }
}