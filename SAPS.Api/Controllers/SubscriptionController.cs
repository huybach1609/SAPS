using Microsoft.AspNetCore.Mvc;
using SAPS.Api.Dtos.Subscription;
using SAPS.Api.Service;

namespace SAPS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubscriptionController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;
        private readonly ILogger<SubscriptionController> _logger;

        public SubscriptionController(
            ISubscriptionService subscriptionService,
            ILogger<SubscriptionController> logger)
        {
            _subscriptionService = subscriptionService;
            _logger = logger;
        }

        /// <summary>
        /// Get all subscriptions
        /// </summary>
        /// <returns>List of subscriptions</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SubscriptionResponseDto>>> GetAllSubscriptions()
        {
            try
            {
                var subscriptions = await _subscriptionService.GetAllSubscriptionsAsync();
                return Ok(subscriptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subscriptions");
                return StatusCode(500, "An error occurred while retrieving subscriptions.");
            }
        }

        /// <summary>
        /// Get subscription by ID
        /// </summary>
        /// <param name="id">Subscription ID</param>
        /// <returns>Subscription details</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<SubscriptionResponseDto>> GetSubscriptionById(string id)
        {
            try
            {
                var subscription = await _subscriptionService.GetSubscriptionByIdAsync(id);
                
                if (subscription == null)
                {
                    return NotFound($"Subscription with ID {id} not found.");
                }
                
                return Ok(subscription);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subscription with ID {SubscriptionId}", id);
                return StatusCode(500, "An error occurred while retrieving the subscription.");
            }
        }

        /// <summary>
        /// Create a new subscription
        /// </summary>
        /// <param name="createDto">Subscription creation data</param>
        /// <returns>Created subscription</returns>
        [HttpPost]
        public async Task<ActionResult<SubscriptionResponseDto>> CreateSubscription([FromBody] CreateSubscriptionDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdSubscription = await _subscriptionService.CreateSubscriptionAsync(createDto);
                
                return CreatedAtAction(
                    nameof(GetSubscriptionById), 
                    new { id = createdSubscription.Id }, 
                    createdSubscription);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating subscription");
                return StatusCode(500, "An error occurred while creating the subscription.");
            }
        }

        /// <summary>
        /// Update an existing subscription
        /// </summary>
        /// <param name="id">Subscription ID</param>
        /// <param name="updateDto">Subscription update data</param>
        /// <returns>Updated subscription</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<SubscriptionResponseDto>> UpdateSubscription(string id, [FromBody] UpdateSubscriptionDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedSubscription = await _subscriptionService.UpdateSubscriptionAsync(id, updateDto);
                return Ok(updatedSubscription);
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"Subscription with ID {id} not found.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating subscription with ID {SubscriptionId}", id);
                return StatusCode(500, "An error occurred while updating the subscription.");
            }
        }
    }
}