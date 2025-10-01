using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.ParkingFeeScheduleDtos;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SAPLSServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ParkingFeeScheduleController : ControllerBase
    {
        private readonly IParkingFeeScheduleService _service;
        private readonly ILogger<ParkingFeeScheduleController> _logger;

        public ParkingFeeScheduleController(IParkingFeeScheduleService service, ILogger<ParkingFeeScheduleController> logger)
        {
            _service = service;
            _logger = logger;
        }

        /// <summary>
        /// Creates a new parking fee schedule. (Parking Lot Owner only)
        /// </summary>
        [HttpPost]
        [Authorize(Policy = Accessibility.PARKING_LOT_OWNER_ACCESS)]
        public async Task<IActionResult> Create([FromBody] CreateParkingFeeScheduleRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in Create: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var performerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                var result = await _service.CreateAsync(request, performerId);
                return Ok(result);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while creating parking fee schedule");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating parking fee schedule");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Updates an existing parking fee schedule. (Parking Lot Owner only)
        /// </summary>
        [HttpPut]
        [Authorize(Policy = Accessibility.PARKING_LOT_OWNER_ACCESS)]
        public async Task<IActionResult> Update([FromBody] UpdateParkingFeeScheduleRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in Update: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var performerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                var result = await _service.UpdateAsync(request, performerId);
                return Ok(result);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while updating parking fee schedule");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating parking fee schedule");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets the list of parking fee schedules for a parking lot.
        /// </summary>
        [HttpGet("by-parking-lot/{parkingLotId}")]
        public async Task<ActionResult<List<ParkingFeeScheduleDto>>> GetListByParkingLot(string parkingLotId)
        {
            try
            {
                var performerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                var result = await _service.GetListByParkingLotAsync(parkingLotId, performerId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting parking fee schedules for ParkingLotId: {ParkingLotId}", parkingLotId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets the details of a parking fee schedule by its ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ParkingFeeScheduleDto>> GetById(string id)
        {
            try
            {
                var performerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                var result = await _service.GetByIdAsync(id, performerId);
                if (result == null)
                {
                    _logger.LogInformation("Parking fee schedule not found for Id: {Id}", id);
                    return NotFound(new { message = MessageKeys.PARKING_FEE_SCHEDULE_NOT_FOUND });
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting parking fee schedule by Id: {Id}", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }
    }
}