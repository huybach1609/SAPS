using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using SAPLSServer.DTOs.Concrete.IncidenceReportDtos;
using SAPLSServer.DTOs.PaginationDto;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SAPLSServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = Accessibility.PARKING_LOT_OWNER_OR_STAFF_ACCESS)]
    public class IncidentReportController : ControllerBase
    {
        private readonly IIncidentReportService _incidentReportService;
        private readonly ILogger<IncidentReportController> _logger;

        public IncidentReportController(IIncidentReportService incidentReportService, ILogger<IncidentReportController> logger)
        {
            _incidentReportService = incidentReportService;
            _logger = logger;
        }

        /// <summary>
        /// Creates a new incident report (Staff only).
        /// </summary>
        [HttpPost]
        [Authorize(Policy = Accessibility.STAFF_ACCESS)]
        public async Task<IActionResult> Create([FromForm] CreateIncidentReportRequest request)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state in Create: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }
            try
            {
                var reporterId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                await _incidentReportService.CreateIncidentReport(request, reporterId);
                return Ok(new { message = MessageKeys.INCIDENT_REPORT_CREATED_SUCCESSFULLY });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while creating an incident report");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating an incident report");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Updates the status of an incident report (Parking Lot Owner only).
        /// </summary>
        [HttpPut("status")]
        [Authorize(Policy = Accessibility.PARKING_LOT_OWNER_ACCESS)]
        public async Task<IActionResult> UpdateStatus([FromBody] UpdateIncidentReportStatusRequest request)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state in UpdateStatus: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }
            try
            {
                var performerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                await _incidentReportService.UpdateIncidentReportStatus(request, performerId);
                return Ok(new { message = MessageKeys.SHARING_STATUS_UPDATED_SUCCESSFULLY });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while updating incident report status");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating incident report status");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets the details of an incident report by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDetails(string id)
        {
            try
            {
                var result = await _incidentReportService.GetIncidentReportDetails(new GetDetailsRequest { Id = id });
                if (result == null)
                {
                    _logger.LogInformation("Incident report not found for ID: {IncidentReportId}", id);
                    return NotFound(new { message = MessageKeys.INCIDENT_REPORT_NOT_FOUND });
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching incident report details for ID: {IncidentReportId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets a list of incident reports.
        /// </summary>
        /// <param name="request">The filter criteria for incident reports.</param>
        /// <returns>A list of incident report summaries.</returns>
        [HttpGet]
        public async Task<IActionResult> GetList([FromQuery] GetIncidenReportListRequest request)
        {
            try
            {
                var result = await _incidentReportService.GetIncidentReportsList(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching incident reports list");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }
        [HttpGet("page")]
        public async Task<IActionResult> GetPagedList([FromQuery] PageRequest pageRequest, [FromQuery] GetIncidenReportListRequest listRequest)
        {
            try
            {
                var result = await _incidentReportService.GetIncidentReportsPage(pageRequest, listRequest);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching paged incident reports list");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }
    }
}