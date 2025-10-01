using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.SharedVehicleDtos;
using SAPLSServer.DTOs.PaginationDto;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;
using System.Security.Claims;
using Microsoft.Extensions.Logging;

namespace SAPLSServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SharedVehicleController : ControllerBase
    {
        private readonly ISharedVehicleService _sharedVehicleService;
        private readonly ILogger<SharedVehicleController> _logger;

        public SharedVehicleController(ISharedVehicleService sharedVehicleService, ILogger<SharedVehicleController> logger)
        {
            _sharedVehicleService = sharedVehicleService;
            _logger = logger;
        }

        /// <summary>
        /// Creates a new shared vehicle invitation
        /// </summary>
        /// <param name="request">Shared vehicle creation request</param>
        /// <returns>Success response</returns>
        [HttpPost("share")]
        [Authorize(Policy = Accessibility.CLIENT_ACCESS)]
        public async Task<IActionResult> ShareVehicle([FromBody] CreateSharedVehicleRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in ShareVehicle: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                await _sharedVehicleService.Create(request);
                return Ok(new { message = MessageKeys.VEHICLE_SHARED_SUCCESSFULLY });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt in ShareVehicle");
                return StatusCode(403, new { message = MessageKeys.UNAUTHORIZED_ACCESS });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided in ShareVehicle");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while sharing vehicle");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpGet("page")]
        [Authorize]
        public async Task<IActionResult> GetSharedVehiclesPage([FromQuery] PageRequest pageRequest,
            [FromQuery] GetSharedVehicleList request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in GetSharedVehiclesPage: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogWarning("Unauthorized access attempt in GetSharedVehiclesPage (no userId in token)");
                    return Unauthorized(new { message = MessageKeys.UNAUTHORIZED_ACCESS });
                }
                var result = await _sharedVehicleService.GetSharedVehiclesPage(pageRequest, request);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt in GetSharedVehiclesPage");
                return StatusCode(403, new { message = MessageKeys.UNAUTHORIZED_ACCESS });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided in GetSharedVehiclesPage");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting shared vehicles page");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetSharedVehicles([FromQuery] GetSharedVehicleList request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in GetSharedVehicles: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogWarning("Unauthorized access attempt in GetSharedVehicles (no userId in token)");
                    return Unauthorized(new { message = MessageKeys.UNAUTHORIZED_ACCESS });
                }
                var result = await _sharedVehicleService.GetSharedVehiclesList(request);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt in GetSharedVehicles");
                return StatusCode(403, new { message = MessageKeys.UNAUTHORIZED_ACCESS });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided in GetSharedVehicles");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting shared vehicles list");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpGet("{sharedVehicleId}")]
        [Authorize]
        public async Task<ActionResult<SharedVehicleDetailsDto>> GetSharedVehicleById(string sharedVehicleId)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogWarning("Unauthorized access attempt in GetSharedVehicleById (no userId in token)");
                    return Unauthorized(new { message = MessageKeys.UNAUTHORIZED_ACCESS });
                }
                var vehicle = await _sharedVehicleService.GetSharedVehicleDetails(sharedVehicleId, userId);
                if (vehicle == null)
                {
                    _logger.LogInformation("Shared vehicle not found for Id: {SharedVehicleId}", sharedVehicleId);
                    return NotFound(new { message = MessageKeys.VEHICLE_NOT_FOUND });
                }
                return Ok(vehicle);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt in GetSharedVehicleById");
                return StatusCode(403, new { message = MessageKeys.UNAUTHORIZED_ACCESS });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided in GetSharedVehicleById");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting shared vehicle by Id");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpPost("{id}/accept")]
        [Authorize(Policy = Accessibility.CLIENT_ACCESS)]
        public async Task<IActionResult> AcceptSharedVehicle(string id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogWarning("Unauthorized access attempt in AcceptSharedVehicle (no userId in token)");
                    return Unauthorized(new { message = MessageKeys.UNAUTHORIZED_ACCESS });
                }

                await _sharedVehicleService.AcceptSharedVehicle(id, userId);
                return Ok(new { message = MessageKeys.VEHICLE_SHARE_ACCEPTED });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt in AcceptSharedVehicle");
                return StatusCode(403, new { message = MessageKeys.UNAUTHORIZED_ACCESS });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided in AcceptSharedVehicle");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while accepting shared vehicle");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpPost("{id}/reject")]
        [Authorize(Policy = Accessibility.CLIENT_ACCESS)]
        public async Task<IActionResult> RejectSharedVehicle(string id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogWarning("Unauthorized access attempt in RejectSharedVehicle (no userId in token)");
                    return Unauthorized(new { message = MessageKeys.UNAUTHORIZED_ACCESS });
                }

                await _sharedVehicleService.RejectSharedVehicle(id, userId);
                return Ok(new { message = MessageKeys.VEHICLE_SHARE_REJECTED });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt in RejectSharedVehicle");
                return StatusCode(403, new { message = MessageKeys.UNAUTHORIZED_ACCESS });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided in RejectSharedVehicle");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while rejecting shared vehicle");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpPost("{id}/recall")]
        [Authorize(Policy = Accessibility.CLIENT_ACCESS)]
        public async Task<IActionResult> RecallSharedVehicle(string id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogWarning("Unauthorized access attempt in RecallSharedVehicle (no userId in token)");
                    return Unauthorized(new { message = MessageKeys.UNAUTHORIZED_ACCESS });
                }

                await _sharedVehicleService.RecallSharedVehicle(id, userId);
                return Ok(new { message = MessageKeys.VEHICLE_SHARE_RECALLED });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt in RecallSharedVehicle");
                return StatusCode(403, new { message = MessageKeys.UNAUTHORIZED_ACCESS });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided in RecallSharedVehicle");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while recalling shared vehicle");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }
        /// <summary>
        /// Gets detailed information about a shared vehicle by its vehicle ID.
        /// </summary>
        /// <param name="vehicleId">The unique identifier of the vehicle.</param>
        /// <returns>Shared vehicle details if found; otherwise, NotFound.</returns>
        [HttpGet("by-vehicle/{vehicleId}")]
        [Authorize(Policy = Accessibility.CLIENT_ACCESS)]
        public async Task<IActionResult> GetByVehicleId(string vehicleId)
        {
            try
            {
                var result = await _sharedVehicleService.GetByVehicleId(vehicleId);
                if (result == null)
                {
                    _logger.LogInformation("Shared vehicle not found for VehicleId: {VehicleId}", vehicleId);
                    return NotFound(new { message = MessageKeys.SHARED_VEHICLE_NOT_FOUND });
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting shared vehicle by VehicleId: {VehicleId}", vehicleId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }
    }
}