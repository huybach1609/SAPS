using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.ParkingSessionDtos;
using SAPLSServer.DTOs.Concrete.PaymentDtos;
using SAPLSServer.DTOs.PaginationDto;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;
using System.Security.Claims;
using System.Text.Json;

namespace SAPLSServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ParkingSessionController : ControllerBase
    {
        private readonly IParkingSessionService _parkingSessionService;
        private readonly ILogger<ParkingSessionController> _logger;

        public ParkingSessionController(IParkingSessionService parkingSessionService, ILogger<ParkingSessionController> logger)
        {
            _parkingSessionService = parkingSessionService;
            _logger = logger;
        }

        [HttpGet("client/{sessionId}")]
        public async Task<IActionResult> GetSessionDetailsForClient(string sessionId)
        {
            try
            {
                var result = await _parkingSessionService.GetSessionDetailsForClient(sessionId);
                if (result == null)
                {
                    _logger.LogInformation("Parking session not found for client. SessionId: {SessionId}", sessionId);
                    return NotFound(new { error = MessageKeys.PARKING_SESSION_NOT_FOUND });
                }

                return Ok(new
                {
                    message = MessageKeys.GET_PARKING_SESSION_DETAILS_SUCCESSFULLY,
                    data = result
                });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while retrieving parking session details for client with SessionId: {SessionId}", sessionId);
                return BadRequest(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt while retrieving parking session details for client with SessionId: {SessionId}", sessionId);
                return StatusCode(403, new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving parking session details for client with SessionId: {SessionId}", sessionId);
                return StatusCode(500, new { error = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpGet("lot/{sessionId}")]
        public async Task<IActionResult> GetSessionDetailsForParkingLot(string sessionId)
        {
            try
            {
                var result = await _parkingSessionService.GetSessionDetailsForParkingLot(sessionId);
                if (result == null)
                {
                    _logger.LogInformation("Parking session not found for parking lot. SessionId: {SessionId}", sessionId);
                    return NotFound(new { error = MessageKeys.PARKING_SESSION_NOT_FOUND });
                }

                return Ok(new
                {
                    message = MessageKeys.GET_PARKING_SESSION_DETAILS_SUCCESSFULLY,
                    data = result
                });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while retrieving parking session details for parking lot with SessionId: {SessionId}", sessionId);
                return BadRequest(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt while retrieving parking session details for parking lot with SessionId: {SessionId}", sessionId);
                return StatusCode(403, new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving parking session details for parking lot with SessionId: {SessionId}", sessionId);
                return StatusCode(500, new { error = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpGet("current/{vehicleId}")]
        public async Task<IActionResult> GetCurrentParkingSession(string vehicleId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(vehicleId))
                {
                    _logger.LogWarning("VehicleId is required in GetCurrentParkingSession");
                    return BadRequest(new { error = MessageKeys.VEHICLE_ID_REQUIRED });
                }

                var result = await _parkingSessionService.GetCurrentParkingSession(vehicleId);
                if (result == null)
                {
                    _logger.LogInformation("Current parking session not found for vehicle. VehicleId: {VehicleId}", vehicleId);
                    return NotFound(new { error = MessageKeys.PARKING_SESSION_NOT_FOUND });
                }

                return Ok(new
                {
                    message = MessageKeys.GET_PARKING_SESSION_DETAILS_SUCCESSFULLY,
                    data = result
                });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while retrieving current parking session for vehicle with VehicleId: {VehicleId}", vehicleId);
                return BadRequest(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt while retrieving current parking session for vehicle with VehicleId: {VehicleId}", vehicleId);
                return StatusCode(403, new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving current parking session for vehicle with VehicleId: {VehicleId}", vehicleId);
                return StatusCode(500, new { error = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpGet("by-client")]
        public async Task<IActionResult> GetSessionsByClient([FromQuery] GetParkingSessionListByClientIdRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in GetSessionsByClient: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _parkingSessionService.GetSessionsByClient(request);
                return Ok(new
                {
                    message = MessageKeys.GET_PARKING_SESSIONS_PAGE_SUCCESSFULLY,
                    data = result
                });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while retrieving parking sessions for client with ClientId: {ClientId}", request.ClientId);
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving parking sessions for client with ClientId: {ClientId}", request.ClientId);
                return StatusCode(500, new { error = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpGet("by-lot")]
        public async Task<IActionResult> GetSessionsByParkingLot([FromQuery] GetParkingSessionListByParkingLotIdRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in GetSessionsByParkingLot: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _parkingSessionService.GetSessionsByParkingLot(request);
                return Ok(new
                {
                    message = MessageKeys.GET_PARKING_SESSIONS_PAGE_SUCCESSFULLY,
                    data = result
                });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while retrieving parking sessions for parking lot with ParkingLotId: {ParkingLotId}", request.ParkingLotId);
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving parking sessions for parking lot with ParkingLotId: {ParkingLotId}", request.ParkingLotId);
                return StatusCode(500, new { error = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpGet("owned/{clientId}")]
        public async Task<IActionResult> GetOwnedSessions([FromQuery] GetOwnedParkingSessionListRequest request, string clientId)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in GetOwnedSessions: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _parkingSessionService.GetOwnedSessions(request, clientId);
                return Ok(new
                {
                    message = MessageKeys.GET_PARKING_SESSIONS_PAGE_SUCCESSFULLY,
                    data = result
                });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while retrieving owned parking sessions for client with ClientId: {ClientId}", clientId);
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving owned parking sessions for client with ClientId: {ClientId}", clientId);
                return StatusCode(500, new { error = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpGet("page/by-client")]
        public async Task<IActionResult> GetPageByClient([FromQuery] PageRequest pageRequest, [FromQuery] GetParkingSessionListByClientIdRequest listRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in GetPageByClient: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _parkingSessionService.GetPageByClient(pageRequest, listRequest);
                return Ok(new
                {
                    message = MessageKeys.GET_PARKING_SESSIONS_PAGE_SUCCESSFULLY,
                    data = result
                });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while retrieving paged parking sessions for client with ClientId: {ClientId}", listRequest.ClientId);
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving paged parking sessions for client with ClientId: {ClientId}", listRequest.ClientId);
                return StatusCode(500, new { error = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpGet("page/by-lot")]
        public async Task<IActionResult> GetPageByParkingLot([FromQuery] PageRequest pageRequest, [FromQuery] GetParkingSessionListByParkingLotIdRequest listRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in GetPageByParkingLot: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _parkingSessionService.GetPageByParkingLot(pageRequest, listRequest);
                return Ok(new
                {
                    message = MessageKeys.GET_PARKING_SESSIONS_PAGE_SUCCESSFULLY,
                    data = result
                });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while retrieving paged parking sessions for parking lot with ParkingLotId: {ParkingLotId}", listRequest.ParkingLotId);
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving paged parking sessions for parking lot with ParkingLotId: {ParkingLotId}", listRequest.ParkingLotId);
                return StatusCode(500, new { error = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpGet("page/owned/{clientId}")]
        public async Task<IActionResult> GetPageByOwnedSessions([FromQuery] PageRequest pageRequest, [FromQuery] GetOwnedParkingSessionListRequest listRequest, string clientId)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in GetPageByOwnedSessions: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _parkingSessionService.GetPageByOwnedSessions(pageRequest, listRequest, clientId);
                return Ok(new
                {
                    message = MessageKeys.GET_PARKING_SESSIONS_PAGE_SUCCESSFULLY,
                    data = result
                });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while retrieving paged owned parking sessions for client with ClientId: {ClientId}", clientId);
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving paged owned parking sessions for client with ClientId: {ClientId}", clientId);
                return StatusCode(500, new { error = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpPost("check-in")]
        public async Task<IActionResult> CheckIn([FromForm] CheckInParkingSessionRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in CheckIn: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var staffId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(staffId))
                {
                    _logger.LogWarning("Unauthorized access attempt in CheckIn");
                    return Unauthorized(new { error = MessageKeys.STAFF_PROFILE_ID_REQUIRED });
                }

                await _parkingSessionService.CheckIn(request, staffId);
                return Ok(new { message = MessageKeys.PARKING_SESSION_CREATED_SUCCESSFULLY });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while checking in a parking session");
                return BadRequest(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt while checking in a parking session");
                return StatusCode(403, new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking in a parking session");
                return StatusCode(500, new { error = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpGet("{sessionId}/payment-info")]
        public async Task<IActionResult> GetSessionPaymentInfo(string sessionId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(sessionId))
                {
                    _logger.LogWarning("SessionId is required in GetSessionPaymentInfo");
                    return BadRequest(new { error = MessageKeys.PARKING_SESSION_ID_REQUIRED });
                }
                var result = await _parkingSessionService.GetSessionPaymentInfo(sessionId);
                if (result == null)
                {
                    _logger.LogInformation("Payment info not found for parking session. SessionId: {SessionId}", sessionId);
                    return NotFound(new { error = MessageKeys.PARKING_SESSION_NOT_FOUND });
                }
                return Ok(new
                {
                    data = result
                });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while retrieving payment info for parking session with SessionId: {SessionId}", sessionId);
                return BadRequest(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt while retrieving payment info for parking session with SessionId: {SessionId}", sessionId);
                return StatusCode(403, new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving payment info for parking session with SessionId: {SessionId}", sessionId);
                return StatusCode(500, new { error = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets payment information for a parking session by staff
        /// </summary>
        [HttpGet("{sessionId}/payment-info-staff")]
        [Authorize(Policy = Accessibility.STAFF_ACCESS)]
        public async Task<IActionResult> GetSessionPaymentInfoByStaff(string sessionId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(sessionId))
                {
                    _logger.LogWarning("SessionId is required in GetSessionPaymentInfoByStaff");
                    return BadRequest(new { error = MessageKeys.PARKING_SESSION_ID_REQUIRED });
                }

                var staffId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(staffId))
                {
                    _logger.LogWarning("StaffId is required in GetSessionPaymentInfoByStaff");
                    return Unauthorized(new { error = MessageKeys.STAFF_PROFILE_ID_REQUIRED });
                }

                var result = await _parkingSessionService.GetSessionPaymentInfoByStaff(sessionId, staffId);
                if (result == null)
                {
                    _logger.LogInformation("Payment info not found for parking session by staff. SessionId: {SessionId}, StaffId: {StaffId}", sessionId, staffId);
                    return NotFound(new { error = MessageKeys.PARKING_SESSION_NOT_FOUND });
                }

                return Ok(new
                {
                    data = result
                });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while retrieving payment info by staff for parking session with SessionId: {SessionId}", sessionId);
                return BadRequest(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt while retrieving payment info by staff for parking session with SessionId: {SessionId}", sessionId);
                return StatusCode(403, new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving payment info by staff for parking session with SessionId: {SessionId}", sessionId);
                return StatusCode(500, new { error = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpPost("check-out")]
        public async Task<IActionResult> CheckOut([FromBody] CheckOutParkingSessionRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in CheckOut: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("Unauthorized access attempt in CheckOut");
                    return Unauthorized(new { error = MessageKeys.USER_ID_REQUIRED });
                }

                await _parkingSessionService.CheckOut(request, userId);
                return Ok(new { message = MessageKeys.PARKING_SESSION_CHECKOUT_UPDATED_SUCCESSFULLY });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while checking out a parking session");
                return BadRequest(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt while checking out a parking session");
                return StatusCode(403, new { error = ex.Message });
            }
            catch (ParkingSessionException ex)
            {
                _logger.LogWarning(ex, "Parking session error occurred while checking out a parking session");
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking out a parking session");
                return StatusCode(500, new { error = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpPost("finish")]
        public async Task<IActionResult> Finish([FromForm] FinishParkingSessionRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in Finish: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var staffId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(staffId))
                {
                    _logger.LogWarning("Unauthorized access attempt in Finish");
                    return Unauthorized(new { error = MessageKeys.STAFF_PROFILE_ID_REQUIRED });
                }

                await _parkingSessionService.Finish(request, staffId);
                return Ok(new { message = MessageKeys.PARKING_SESSION_EXIT_UPDATED_SUCCESSFULLY });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while finishing a parking session");
                return BadRequest(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt while finishing a parking session");
                return StatusCode(403, new { error = ex.Message });
            }
            catch (ParkingSessionException ex)
            {
                _logger.LogWarning(ex, "Parking session error occurred while finishing a parking session");
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while finishing a parking session");
                return StatusCode(500, new { error = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpPost("force-finish")]
        [Authorize(Policy = Accessibility.STAFF_ACCESS)]
        public async Task<IActionResult> ForceFinish([FromForm] FinishParkingSessionRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in ForceFinish: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var staffId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(staffId))
                {
                    _logger.LogWarning("Unauthorized access attempt in ForceFinish");
                    return Unauthorized(new { error = MessageKeys.STAFF_PROFILE_ID_REQUIRED });
                }

                await _parkingSessionService.ForceFinish(request, staffId);
                return Ok(new { message = "Parking session force finished successfully." });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while force finishing a parking session");
                return BadRequest(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt while force finishing a parking session");
                return StatusCode(403, new { error = ex.Message });
            }
            catch (ParkingSessionException ex)
            {
                _logger.LogWarning(ex, "Parking session error occurred while force finishing a parking session");
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while force finishing a parking session");
                return StatusCode(500, new { error = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpGet("transaction-id/{sessionId}")]
        public async Task<IActionResult> GetSessionByTransactionId(string sessionId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(sessionId))
                {
                    _logger.LogWarning("SessionId is required in GetSessionByTransactionId");
                    return BadRequest(new { error = MessageKeys.PARKING_SESSION_ID_REQUIRED });
                }
                var result = await _parkingSessionService.GetSessionTransactionId(sessionId);
                if (result == null)
                {
                    _logger.LogInformation("Transaction ID not found for parking session. SessionId: {SessionId}", sessionId);
                    return NotFound(new { error = MessageKeys.TRANSACTION_ID_NOT_FOUND });
                }
                return Ok(new
                {
                    message = MessageKeys.GET_PARKING_SESSION_DETAILS_SUCCESSFULLY,
                    data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving transaction ID for parking session with SessionId: {SessionId}", sessionId);
                return StatusCode(500, new { error = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        

        [HttpPost("complete-payment")]
        [AllowAnonymous]
        public async Task<IActionResult> CompletePayment([FromBody] PaymentWebHookRequest paymentWebHookRequest)
        {
            try
            {
                _logger.LogInformation("Received PaymentWebHookRequest: {Request}", JsonSerializer.Serialize(paymentWebHookRequest));
                await _parkingSessionService.ConfirmTransaction(paymentWebHookRequest);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing payment webhook");
                return StatusCode(500, new { error = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        [HttpGet("license-plate/{parkingLotId}/{licensePlate}")]
        public async Task<IActionResult> GetActiveSessionByLicensePlate(string parkingLotId, string licensePlate)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(licensePlate))
                {
                    _logger.LogWarning("License plate is required in GetActiveSessionByLicensePlate");
                    return BadRequest(new { error = MessageKeys.LICENSE_PLATE_REQUIRED });
                }
                var result = await _parkingSessionService.GetByLicensePlateNumber(licensePlate, parkingLotId);
                if (result == null)
                {
                    _logger.LogInformation("Active parking session not found for license plate: {LicensePlate} in ParkingLotId: {ParkingLotId}", licensePlate, parkingLotId);
                    return NotFound(new { error = MessageKeys.PARKING_SESSION_NOT_FOUND });
                }
                return Ok(new
                {
                    message = MessageKeys.GET_PARKING_SESSION_DETAILS_SUCCESSFULLY,
                    data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving active parking session for license plate: {LicensePlate} in ParkingLotId: {ParkingLotId}", licensePlate, parkingLotId);
                return StatusCode(500, new { error = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Cancels a payment request by parking session ID
        /// </summary>
        [HttpPost("payment/{parkingSessionId}/cancel")]
        public async Task<ActionResult<PaymentStatusResponseDto>> CancelPaymentBySession(string parkingSessionId, [FromBody] PaymentCancelRequestDto request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(parkingSessionId))
                {
                    _logger.LogWarning("Invalid parkingSessionId in CancelPaymentBySession: {ParkingSessionId}", parkingSessionId);
                    return BadRequest(new { message = "Invalid parking session ID" });
                }

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in CancelPaymentBySession: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _parkingSessionService.SendCancelPaymentRequest(request, parkingSessionId);

                if (result == null)
                {
                    _logger.LogError("Payment service unavailable when cancelling payment for ParkingSessionId: {ParkingSessionId}", parkingSessionId);
                    return StatusCode(StatusCodes.Status500InternalServerError,
                        new { message = MessageKeys.PAYOS_SERVICE_UNAVAILABLE });
                }

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Operation failed in CancelPaymentBySession for ParkingSessionId: {ParkingSessionId}", parkingSessionId);
                return StatusCode(StatusCodes.Status503ServiceUnavailable,
                    new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in CancelPaymentBySession for ParkingSessionId: {ParkingSessionId}", parkingSessionId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets the status of a payment by parking session ID
        /// </summary>
        [HttpGet("payment/{parkingSessionId}/status")]
        public async Task<ActionResult<PaymentStatusResponseDto>> GetPaymentStatusBySession(string parkingSessionId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(parkingSessionId))
                {
                    _logger.LogWarning("Invalid parkingSessionId in GetPaymentStatusBySession: {ParkingSessionId}", parkingSessionId);
                    return BadRequest(new { message = "Invalid parking session ID" });
                }

                var result = await _parkingSessionService.GetPaymentStatus(parkingSessionId);

                if (result == null)
                {
                    _logger.LogInformation("Payment not found for parking session in GetPaymentStatusBySession: {ParkingSessionId}", parkingSessionId);
                    return NotFound(new { message = "Payment not found for parking session" });
                }

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Operation failed in GetPaymentStatusBySession for ParkingSessionId: {ParkingSessionId}", parkingSessionId);
                return StatusCode(StatusCodes.Status503ServiceUnavailable,
                    new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in GetPaymentStatusBySession for ParkingSessionId: {ParkingSessionId}", parkingSessionId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }
    }
}