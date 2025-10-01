using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using SAPLSServer.DTOs.Concrete.VehicleDtos;
using SAPLSServer.DTOs.PaginationDto;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;
using System.Security.Claims;

namespace SAPLSServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VehicleController : ControllerBase
    {
        private readonly IVehicleService _vehicleService;
        private readonly ILogger<VehicleController> _logger;

        public VehicleController(IVehicleService vehicleService, ILogger<VehicleController> logger)
        {
            _vehicleService = vehicleService;
            _logger = logger;
        }

        /// <summary>
        /// Registers a new vehicle in the system
        /// </summary>
        /// <param name="request">Vehicle registration request with registration certificates</param>
        /// <returns>Success response</returns>
        [HttpPost("register")]
        [Authorize(Policy = Accessibility.CLIENT_ACCESS)]
        public async Task<IActionResult> RegisterVehicle([FromForm] CreateVehicleRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in RegisterVehicle: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
                await _vehicleService.Create(request, currentUserId);
                return Ok(new { message = MessageKeys.VEHICLE_CREATED_SUCCESSFULLY });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while registering vehicle");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while registering vehicle");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Updates an existing vehicle's information
        /// </summary>
        /// <param name="request">Vehicle update request</param>
        /// <returns>Success response</returns>
        [HttpPut]
        [Authorize(Policy = Accessibility.CLIENT_ACCESS)]
        public async Task<IActionResult> UpdateVehicle([FromForm] UpdateVehicleRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in UpdateVehicle: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
                await _vehicleService.Update(request, currentUserId);
                return Ok(new { message = MessageKeys.VEHICLE_UPDATED_SUCCESSFULLY });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt while updating vehicle");
                return StatusCode(403, new { message = MessageKeys.UNAUTHORIZED_ACCESS });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while updating vehicle");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating vehicle");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Updates a vehicle's status (active/inactive)
        /// </summary>
        /// <param name="request">Vehicle status update request</param>
        /// <returns>Success response</returns>
        [HttpPut("status")]
        [Authorize(Policy = Accessibility.CLIENT_ACCESS)]
        public async Task<IActionResult> UpdateVehicleStatus([FromBody] UpdateVehicleStatusRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in UpdateVehicleStatus: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
                await _vehicleService.UpdateStatus(request, currentUserId);
                return Ok(new { message = MessageKeys.VEHICLE_UPDATED_SUCCESSFULLY });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt while updating vehicle status");
                return StatusCode(403, new { message = MessageKeys.UNAUTHORIZED_ACCESS });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while updating vehicle status");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating vehicle status");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets vehicle details by vehicle ID
        /// </summary>
        /// <param name="id">Vehicle ID</param>
        /// <returns>Vehicle details</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<VehicleDetailsDto>> GetVehicleById(string id)
        {
            try
            {
                var result = await _vehicleService.GetById(id);
                if (result == null)
                {
                    _logger.LogInformation("Vehicle not found for Id: {Id}", id);
                    return NotFound(new { message = MessageKeys.VEHICLE_NOT_FOUND });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving vehicle by Id: {Id}", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets vehicle details by license plate
        /// </summary>
        /// <param name="licensePlate">Vehicle license plate</param>
        /// <returns>Vehicle details</returns>
        [HttpGet("license-plate/{licensePlate}")]
        public async Task<ActionResult<VehicleDetailsDto>> GetVehicleByLicensePlate(string licensePlate)
        {
            try
            {
                var result = await _vehicleService.GetByLicensePlate(licensePlate);
                if (result == null)
                {
                    _logger.LogInformation("Vehicle not found for LicensePlate: {LicensePlate}", licensePlate);
                    return NotFound(new { message = MessageKeys.VEHICLE_NOT_FOUND });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving vehicle by LicensePlate: {LicensePlate}", licensePlate);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets paginated list of vehicles for a specific owner
        /// </summary>
        /// <param name="pageRequest">Pagination parameters</param>
        /// <param name="request">Filter criteria (OwnerId required)</param>
        /// <returns>Paginated vehicle list</returns>
        [HttpGet("page")]
        public async Task<ActionResult<PageResult<VehicleSummaryDto>>> GetVehiclesPage([FromQuery] PageRequest pageRequest, [FromQuery] GetVehicleListRequest request)
        {
            try
            {
                var result = await _vehicleService.GetVehiclesPage(pageRequest, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving vehicles page");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets list of vehicles for a specific owner
        /// </summary>
        /// <param name="request">Filter criteria (OwnerId required)</param>
        /// <returns>List of vehicles</returns>
        [HttpGet]
        public async Task<ActionResult<List<VehicleSummaryDto>>> GetVehiclesList([FromQuery] GetVehicleListRequest request)
        {
            try
            {
                var result = await _vehicleService.GetAllVehicles(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving vehicles list");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Deletes a vehicle from the system
        /// </summary>
        /// <param name="request">Delete request with vehicle ID</param>
        /// <returns>Success response</returns>
        [HttpDelete]
        [Authorize(Policy = Accessibility.CLIENT_ACCESS)]
        public async Task<IActionResult> DeleteVehicle([FromBody] DeleteRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in DeleteVehicle: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
                await _vehicleService.DeleteVehicle(request, currentUserId);
                return Ok(new { message = MessageKeys.VEHICLE_DELETED_SUCCESSFULLY });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt while deleting vehicle");
                return StatusCode(403, new { message = MessageKeys.UNAUTHORIZED_ACCESS });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while deleting vehicle");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting vehicle");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets vehicles owned by the current user
        /// </summary>
        /// <returns>List of user's vehicles</returns>
        [HttpGet("my-vehicles")]
        [Authorize(Policy = Accessibility.CLIENT_ACCESS)]
        public async Task<ActionResult<List<VehicleSummaryDto>>> GetMyVehicles([FromQuery] string? status = null, [FromQuery] string? sharingStatus = null)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrWhiteSpace(currentUserId))
                {
                    _logger.LogWarning("Unauthorized access attempt in GetMyVehicles (no userId in token)");
                    return Unauthorized(new { message = MessageKeys.UNAUTHORIZED_ACCESS });
                }

                var request = new GetVehicleListRequest
                {
                    OwnerId = currentUserId,
                    Status = status,
                    SharingStatus = sharingStatus
                };

                var result = await _vehicleService.GetAllVehicles(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving my vehicles");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }
    }
}