using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.PaymentDtos;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;

namespace SAPLSServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly string _apiKey;
        private readonly string _clientKey;
        private readonly string _checkSumKey;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(IPaymentService paymentService, IPaymentSettings paymentSettings, ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _apiKey = paymentSettings.PaymentGatewayApiKey;
            _clientKey = paymentSettings.PaymentGatewayClientKey;
            _checkSumKey = paymentSettings.PaymentGatewayCheckSumKey;
            _logger = logger;
        }

        /// <summary>
        /// Creates a new payment request
        /// </summary>
        [HttpPost("request")]
        public async Task<ActionResult<PaymentStatusResponseDto>> CreatePaymentRequest([FromBody] PaymentRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in CreatePaymentRequest: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _paymentService.SendPaymentRequest(request, _clientKey, _apiKey, _checkSumKey);

                if (result == null)
                {
                    _logger.LogError("Payment service unavailable when creating payment request for OrderCode: {OrderCode}", request.OrderCode);
                    return StatusCode(StatusCodes.Status500InternalServerError,
                        new { message = MessageKeys.PAYOS_SERVICE_UNAVAILABLE });
                }

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Payment service unavailable (InvalidOperationException) in CreatePaymentRequest for OrderCode: {OrderCode}", request.OrderCode);
                return StatusCode(StatusCodes.Status503ServiceUnavailable,
                    new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in CreatePaymentRequest for OrderCode: {OrderCode}", request.OrderCode);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets the status of a specific payment by payment ID
        /// </summary>
        [HttpGet("{paymentId}/status")]
        public async Task<ActionResult<PaymentStatusResponseDto>> GetPaymentStatus(int paymentId)
        {
            try
            {
                if (paymentId <= 0)
                {
                    _logger.LogWarning("Invalid paymentId in GetPaymentStatus: {PaymentId}", paymentId);
                    return BadRequest(new { message = "Invalid payment ID" });
                }

                var result = await _paymentService.GetPaymentStatus(paymentId, _clientKey, _apiKey);

                if (result == null)
                {
                    _logger.LogInformation("Payment not found in GetPaymentStatus: {PaymentId}", paymentId);
                    return NotFound(new { message = "Payment not found" });
                }

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Payment service unavailable (InvalidOperationException) in GetPaymentStatus for PaymentId: {PaymentId}", paymentId);
                return StatusCode(StatusCodes.Status503ServiceUnavailable,
                    new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in GetPaymentStatus for PaymentId: {PaymentId}", paymentId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Cancels a payment request by payment ID
        /// </summary>
        [HttpPost("{paymentId}/cancel")]
        public async Task<ActionResult<PaymentStatusResponseDto>> CancelPayment(int paymentId, [FromBody] PaymentCancelRequestDto request)
        {
            try
            {
                if (paymentId <= 0)
                {
                    _logger.LogWarning("Invalid paymentId in CancelPayment: {PaymentId}", paymentId);
                    return BadRequest(new { message = "Invalid payment ID" });
                }

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in CancelPayment: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _paymentService.SendCancelPaymentRequest(paymentId, _clientKey, _apiKey, request);

                if (result == null)
                {
                    _logger.LogError("Payment service unavailable when cancelling payment for PaymentId: {PaymentId}", paymentId);
                    return StatusCode(StatusCodes.Status500InternalServerError,
                        new { message = MessageKeys.PAYOS_SERVICE_UNAVAILABLE });
                }

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Payment service unavailable (InvalidOperationException) in CancelPayment for PaymentId: {PaymentId}", paymentId);
                return StatusCode(StatusCodes.Status503ServiceUnavailable,
                    new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in CancelPayment for PaymentId: {PaymentId}", paymentId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }
    }
}