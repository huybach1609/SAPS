using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.ShiftDiaryDtos;
using SAPLSServer.DTOs.PaginationDto;
using SAPLSServer.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SAPLSServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = Accessibility.PARKING_LOT_OWNER_OR_STAFF_ACCESS)]
    public class ShiftDiaryController : ControllerBase
    {
        private readonly IShiftDiaryService _shiftDiaryService;
        private readonly ILogger<ShiftDiaryController> _logger;

        public ShiftDiaryController(IShiftDiaryService shiftDiaryService, ILogger<ShiftDiaryController> logger)
        {
            _shiftDiaryService = shiftDiaryService;
            _logger = logger;
        }

        /// <summary>
        /// Creates a new shift diary entry (Staff only).
        /// </summary>
        [HttpPost]
        [Authorize(Policy = Accessibility.STAFF_ACCESS)]
        public async Task<IActionResult> Create([FromBody] CreateShiftDiaryRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in Create: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var senderId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                var result = await _shiftDiaryService.CreateAsync(request, senderId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating shift diary entry");
                return StatusCode(500, new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets the details of a shift diary by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDetails(string id)
        {
            try
            {
                var result = await _shiftDiaryService.GetDetailsAsync(id);
                if (result == null)
                {
                    _logger.LogInformation("Shift diary not found for Id: {Id}", id);
                    return NotFound(new { message = MessageKeys.SHIFT_DIARY_NOT_FOUND });
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving shift diary details for Id: {Id}", id);
                return StatusCode(500, new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets a list of shift diaries.
        /// </summary>
        [HttpGet("list")]
        public async Task<IActionResult> GetList([FromQuery] GetShiftDiaryListRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in GetList: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _shiftDiaryService.GetListAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving shift diary list");
                return StatusCode(500, new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets a paginated list of shift diaries.
        /// </summary>
        [HttpGet("page")]
        public async Task<IActionResult> GetPage([FromQuery] PageRequest pageRequest, [FromQuery] GetShiftDiaryListRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in GetPage: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _shiftDiaryService.GetPageAsync(pageRequest, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving paginated shift diary list");
                return StatusCode(500, new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }
    }
}