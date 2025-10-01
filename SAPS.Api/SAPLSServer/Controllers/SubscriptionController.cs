using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.SubscriptionDtos;
using SAPLSServer.DTOs.PaginationDto;
using SAPLSServer.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SAPLSServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubscriptionController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;
        private readonly ILogger<SubscriptionController> _logger;

        public SubscriptionController(ISubscriptionService subscriptionService, ILogger<SubscriptionController> logger)
        {
            _subscriptionService = subscriptionService;
            _logger = logger;
        }

        /// <summary>
        /// Get a filtered list of subscriptions.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<SubscriptionSummaryDto>>> GetList([FromQuery] GetSubscriptionListRequest request)
        {
            try
            {
                var result = await _subscriptionService.GetListAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving subscription list");
                return StatusCode(500, new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Get a paginated, filtered list of subscriptions.
        /// </summary>
        [HttpGet("page")]
        public async Task<ActionResult<List<SubscriptionSummaryDto>>> GetPage([FromQuery] PageRequest pageRequest, [FromQuery] GetSubscriptionListRequest request)
        {
            try
            {
                var result = await _subscriptionService.GetPageAsync(pageRequest, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving paginated subscription list");
                return StatusCode(500, new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Get details of a specific subscription.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDetails(string id)
        {
            try
            {
                var result = await _subscriptionService.GetDetailsAsync(id);
                if (result == null)
                {
                    _logger.LogInformation("Subscription not found for Id: {Id}", id);
                    return NotFound();
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving subscription details for Id: {Id}", id);
                return StatusCode(500, new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// CheckIn a new subscription.
        /// </summary>
        [HttpPost]
        [Authorize(Policy = Accessibility.ADMIN_ACCESS)]
        public async Task<IActionResult> Create([FromBody] CreateSubscriptionRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in Create: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }
                var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (adminId == null)
                {
                    _logger.LogWarning("Unauthorized access attempt in Create (no adminId in token)");
                    return Unauthorized(new { message = MessageKeys.UNAUTHORIZED_ACCESS });
                }
                await _subscriptionService.CreateAsync(request, adminId);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating subscription");
                return StatusCode(500, new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Update the status of a subscription.
        /// </summary>
        [HttpPut("status")]
        [Authorize(Policy = Accessibility.ADMIN_ACCESS)]
        public async Task<IActionResult> UpdateStatus([FromBody] UpdateSubscriptionStatusRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in UpdateStatus: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }
                var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (adminId == null)
                {
                    _logger.LogWarning("Unauthorized access attempt in UpdateStatus (no adminId in token)");
                    return Unauthorized(new { message = MessageKeys.UNAUTHORIZED_ACCESS });
                }
                await _subscriptionService.UpdateStatusAsync(request, adminId);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating subscription status");
                return StatusCode(500, new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpPut]
        [Authorize(Policy = Accessibility.ADMIN_ACCESS)]
        public async Task<IActionResult> Update([FromBody] UpdateSubscriptionRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in Update: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }
                var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (adminId == null)
                {
                    _logger.LogWarning("Unauthorized access attempt in Update (no adminId in token)");
                    return Unauthorized(new { message = MessageKeys.UNAUTHORIZED_ACCESS });
                }
                await _subscriptionService.UpdateAsync(request, adminId);
                return Ok();
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while updating subscription");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating subscription");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }
    }
}