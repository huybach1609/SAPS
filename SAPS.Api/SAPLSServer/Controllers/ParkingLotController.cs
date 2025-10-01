using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using SAPLSServer.DTOs.Concrete.ParkingLotDtos;
using SAPLSServer.DTOs.Concrete.PaymentDtos;
using SAPLSServer.DTOs.PaginationDto;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Implementations;
using SAPLSServer.Services.Interfaces;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;

namespace SAPLSServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ParkingLotController : ControllerBase
    {
        private readonly IParkingLotService _parkingLotService;
        private readonly ILogger<ParkingLotController> _logger;
        public ParkingLotController(IParkingLotService parkingLotService, ILogger<ParkingLotController> logger)
        {
            _parkingLotService = parkingLotService;
            _logger = logger;
        }

        /// <summary>
        /// Creates a new parking lot.
        /// </summary>
        [HttpPost]
        [Authorize(Policy = Accessibility.ADMIN_ACCESS)]
        public async Task<IActionResult> Create([FromBody] CreateParkingLotRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in Create: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var performerAdminId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                await _parkingLotService.CreateParkingLot(request, performerAdminId);
                return Ok(new { message = MessageKeys.PARKING_LOT_CREATED_SUCCESSFULLY });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while creating parking lot");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating parking lot");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Updates the basic information of a parking lot.
        /// </summary>
        [HttpPut("basic-info")]
        [Authorize(Policy = Accessibility.PARKING_LOT_OWNER_ACCESS)]
        public async Task<IActionResult> UpdateBasicInfo([FromBody] UpdateParkingLotBasicInformationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in UpdateBasicInfo: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var performerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                await _parkingLotService.UpdateParkingLotBasicInformation(request, performerId);
                return Ok(new { message = MessageKeys.PARKING_LOT_BASIC_INFO_UPDATED_SUCCESSFULLY });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while updating parking lot basic info");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating parking lot basic info");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Updates the address of a parking lot.
        /// </summary>
        [HttpPut("address")]
        [Authorize(Policy = Accessibility.ADMIN_ACCESS)]
        public async Task<IActionResult> UpdateAddress([FromBody] UpdateParkingLotAddressRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in UpdateAddress: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var performerAdminId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                await _parkingLotService.UpdateParkingLotAddress(request, performerAdminId);
                return Ok(new { message = MessageKeys.PARKING_LOT_ADDRESS_UPDATED_SUCCESSFULLY });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while updating parking lot address");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating parking lot address");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Updates the subscription of a parking lot.
        /// </summary>
        [HttpPut("subscription")]
        [Authorize(Policy = Accessibility.PARKING_LOT_OWNER_ACCESS)]
        public async Task<IActionResult> UpdateSubscription([FromBody] UpdateParkingLotSubscriptionRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in UpdateSubscription: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var performerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                var transactionId = await _parkingLotService.UpdateParkingLotSubscription(request, performerId);
                return Ok(new { message = MessageKeys.PARKING_LOT_BASIC_INFO_UPDATED_SUCCESSFULLY, transactionId });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while updating parking lot subscription");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating parking lot subscription");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets the details of a parking lot by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDetails(string id)
        {
            try
            {
                var result = await _parkingLotService.GetParkingLotDetails(id);
                if (result == null)
                {
                    _logger.LogInformation("Parking lot not found for Id: {Id}", id);
                    return NotFound(new { message = MessageKeys.PARKING_LOT_NOT_FOUND });
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting parking lot details for Id: {Id}", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets a paginated list of parking lots.
        /// </summary>
        [HttpGet("page")]
        public async Task<IActionResult> GetPage([FromQuery] PageRequest pageRequest, [FromQuery] GetParkingLotListRequest request)
        {
            try
            {
                var result = await _parkingLotService.GetParkingLotsPage(pageRequest, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting paginated parking lots");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets a list of parking lots.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetList([FromQuery] GetParkingLotListRequest request)
        {
            try
            {
                var result = await _parkingLotService.GetParkingLots(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting parking lot list");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Deletes a parking lot.
        /// </summary>
        [HttpDelete]
        [Authorize(Policy = Accessibility.HEAD_ADMIN_ACCESS)]
        public async Task<IActionResult> Delete([FromBody] DeleteRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in Delete: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                await _parkingLotService.DeleteParkingLot(request);
                return Ok(new { message = MessageKeys.PARKING_LOT_DELETED_SUCCESSFULLY });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while deleting parking lot");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting parking lot");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }
        [HttpPost("complete-payment")]
        [AllowAnonymous]
        public async Task<IActionResult> CompletePayment([FromBody] PaymentWebHookRequest paymentWebHookRequest)
        {
            try
            {
                _logger.LogInformation("Received PaymentWebHookRequest: {Request}", JsonSerializer.Serialize(paymentWebHookRequest));
                await _parkingLotService.ConfirmTransaction(paymentWebHookRequest);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing payment webhook");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets the subscription details by parking lot ID.
        /// </summary>
        [HttpGet("subscription/{parkingLotId}")]
        [Authorize(Policy = Accessibility.ADMIN_PARKINGLOT_OWNER_ACCESS)]
        public async Task<IActionResult> GetSubscriptionByParkingLotId(string parkingLotId)
        {
            try
            {
                var result = await _parkingLotService.GetSubscriptionByParkingLotId(parkingLotId);
                if (result == null)
                {
                    _logger.LogInformation("Subscription not found for ParkingLotId: {ParkingLotId}", parkingLotId);
                    return NotFound(new { message = MessageKeys.SUBSCRIPTION_NOT_FOUND });
                }
                return Ok(result);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while getting subscription for ParkingLotId: {ParkingLotId}", parkingLotId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting subscription for ParkingLotId: {ParkingLotId}", parkingLotId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets the parking lot details for the owner by parking lot ID.
        /// </summary>
        [HttpGet("for-owner/{parkingLotId}")]
        [Authorize(Policy = Accessibility.ADMIN_PARKINGLOT_OWNER_ACCESS)]
        public async Task<IActionResult> GetDetailsForOwner(string parkingLotId)
        {
            try
            {
                var result = await _parkingLotService.GetParkingLotDetailsForOwner(parkingLotId);
                if (result == null)
                {
                    _logger.LogInformation("Parking lot not found for owner. ParkingLotId: {ParkingLotId}", parkingLotId);
                    return NotFound(new { message = MessageKeys.PARKING_LOT_NOT_FOUND });
                }
                return Ok(result);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while getting parking lot details for owner. ParkingLotId: {ParkingLotId}", parkingLotId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting parking lot details for owner. ParkingLotId: {ParkingLotId}", parkingLotId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets the latest payment details by parking lot ID.
        /// </summary>
        [HttpGet("latest-payment/{parkingLotId}")]
        [Authorize(Policy = Accessibility.ADMIN_PARKINGLOT_OWNER_ACCESS)]
        public async Task<IActionResult> GetLatestPaymentByParkingLotId(string parkingLotId)
        {
            try
            {
                var result = await _parkingLotService.GetLatestPaymentByParkingLotId(parkingLotId);
                if (result == null)
                {
                    _logger.LogInformation("Latest payment not found for ParkingLotId: {ParkingLotId}", parkingLotId);
                    return NotFound(new { message = MessageKeys.PARKING_LOT_NOT_FOUND });
                }
                return Ok(result);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while getting latest payment for ParkingLotId: {ParkingLotId}", parkingLotId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting latest payment for ParkingLotId: {ParkingLotId}", parkingLotId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }
    }
}