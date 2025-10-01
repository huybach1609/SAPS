using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.NotificationDtos;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;

namespace SAPLSServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly IFirebaseNotificationService _notificationService;
        private readonly ILogger<NotificationController> _logger;

        public NotificationController(IFirebaseNotificationService notificationService, ILogger<NotificationController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        /// <summary>
        /// Sends a notification to a specific device token (Client provides their own token)
        /// </summary>
        /// <param name="deviceToken">FCM device token from client</param>
        /// <param name="notification">Notification content</param>
        /// <returns>Notification response</returns>
        [HttpPost("send-to-token")]
        [Authorize(Policy = Accessibility.CLIENT_ACCESS)]
        public async Task<ActionResult<NotificationResponse>> SendToToken([FromQuery] string deviceToken, [FromBody] NotificationRequest notification)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in SendToToken: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                if (!_notificationService.ValidateDeviceToken(deviceToken))
                {
                    _logger.LogWarning("Invalid device token format: {DeviceToken}", deviceToken);
                    return BadRequest(new { message = "Invalid device token format" });
                }

                var result = await _notificationService.SendNotificationToTokenAsync(deviceToken, notification);
                return Ok(result);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information in SendToToken: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in SendToToken");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Sends notifications to multiple device tokens
        /// </summary>
        /// <param name="request">Bulk notification request with tokens</param>
        /// <returns>Notification response</returns>
        [HttpPost("send-bulk")]
        [Authorize(Policy = Accessibility.CLIENT_ACCESS)]
        public async Task<ActionResult<NotificationResponse>> SendBulkNotification([FromBody] BulkTokenNotificationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in SendBulkNotification: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _notificationService.SendBulkNotificationToTokensAsync(request.DeviceTokens, request.Notification);
                return Ok(result);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information in SendBulkNotification: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in SendBulkNotification");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Sends a notification to a topic
        /// </summary>
        /// <param name="topic">Topic name</param>
        /// <param name="notification">Notification content</param>
        /// <returns>Notification response</returns>
        [HttpPost("send-to-topic/{topic}")]
        [Authorize(Policy = Accessibility.CLIENT_ACCESS)]
        public async Task<ActionResult<NotificationResponse>> SendTopicNotification(string topic, [FromBody] NotificationRequest notification)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in SendTopicNotification: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _notificationService.SendNotificationToTopicAsync(topic, notification);
                return Ok(result);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information in SendTopicNotification: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in SendTopicNotification");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }
    }
}