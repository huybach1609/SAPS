using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.ParkingLotShiftDtos;
using SAPLSServer.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SAPLSServer.Exceptions;

namespace SAPLSServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = Accessibility.PARKING_LOT_OWNER_ACCESS)]
    public class ParkingLotShiftController : ControllerBase
    {
        private readonly IParkingLotShiftService _shiftService;
        private readonly ILogger<ParkingLotShiftController> _logger;

        public ParkingLotShiftController(IParkingLotShiftService shiftService, ILogger<ParkingLotShiftController> logger)
        {
            _shiftService = shiftService;
            _logger = logger;
        }

        /// <summary>
        /// Gets all shifts for a specific parking lot.
        /// </summary>
        [HttpGet("by-parking-lot/{parkingLotId}")]
        public async Task<ActionResult<List<ParkingLotShiftDto>>> GetByParkingLot(string parkingLotId)
        {
            try
            {
                var result = await _shiftService.GetShiftsByParkingLotAsync(parkingLotId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting shifts for ParkingLotId: {ParkingLotId}", parkingLotId);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets the details of a shift by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ParkingLotShiftDto>> GetById(string id)
        {
            try
            {
                var result = await _shiftService.GetShiftByIdAsync(id);
                if (result == null)
                {
                    _logger.LogInformation("Shift not found for Id: {Id}", id);
                    return NotFound(new { message = MessageKeys.SHIFT_NOT_FOUND });
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting shift by Id: {Id}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Creates a new parking lot shift.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateParkingLotShiftRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in Create: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var performerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                var result = await _shiftService.CreateShiftAsync(request, performerId);
                return Ok(result);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while creating parking lot shift");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating parking lot shift");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Updates an existing parking lot shift.
        /// </summary>
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateParkingLotShiftRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in Update: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var performerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                var success = await _shiftService.UpdateShiftAsync(request, performerId);
                if (!success)
                {
                    _logger.LogInformation("Shift not found for update. Id: {Id}", request.Id);
                    return NotFound(new { message = MessageKeys.SHIFT_NOT_FOUND });
                }
                return Ok(new { message = MessageKeys.SHIFT_UPDATED_SUCCESSFULLY });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating parking lot shift. Id: {Id}", request.Id);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Deletes a parking lot shift.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var performerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                var success = await _shiftService.DeleteShiftAsync(id, performerId);
                if (!success)
                {
                    _logger.LogInformation("Shift not found for delete. Id: {Id}", id);
                    return NotFound(new { message = MessageKeys.SHIFT_NOT_FOUND });
                }
                return Ok(new { message = MessageKeys.SHIFT_DELETED_SUCCESSFULLY });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting parking lot shift. Id: {Id}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }
    }
}