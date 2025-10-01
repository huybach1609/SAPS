using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.WhiteListDtos;
using SAPLSServer.DTOs.PaginationDto;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace SAPLSServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WhiteListController : ControllerBase
    {
        private readonly IWhiteListService _whiteListService;
        private readonly ILogger<WhiteListController> _logger;

        public WhiteListController(IWhiteListService whiteListService, IParkingLotService parkingLotService, ILogger<WhiteListController> logger)
        {
            _whiteListService = whiteListService;
            _logger = logger;
        }

        /// <summary>
        /// Checks if a client is whitelisted in a parking lot.
        /// </summary>
        [HttpGet("check")]
        public async Task<IActionResult> IsClientWhitelisted([FromQuery] string parkingLotId, [FromQuery] string clientId)
        {
            try
            {
                var result = await _whiteListService.IsClientWhitelistedAsync(parkingLotId, clientId);
                return Ok(new { isWhitelisted = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking whitelist for ParkingLotId: {ParkingLotId}, ClientId: {ClientId}", parkingLotId, clientId);
                return StatusCode(500, new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Adds a client to the whitelist.
        /// </summary>
        [HttpPost]
        [Authorize(Policy = Accessibility.PARKING_LOT_OWNER_ACCESS)]
        public async Task<IActionResult> AddToWhiteList([FromBody] AddAttendantToWhiteListRequest request)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state in AddToWhiteList: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
                await _whiteListService.AddToWhiteListAsync(request, currentUserId);
                return Ok(new { message = MessageKeys.CLIENT_ADDED_TO_WHITE_LIST });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information in AddToWhiteList for ParkingLotId: {ParkingLotId}, ClientId: {ClientId}", request.ParkingLotId, request.ClientId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding to whitelist for ParkingLotId: {ParkingLotId}, ClientId: {ClientId}", request.ParkingLotId, request.ClientId);
                return StatusCode(500, new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Updates the expiration date of a whitelist entry.
        /// </summary>
        [HttpPut("expire-date")]
        [Authorize(Policy = Accessibility.PARKING_LOT_OWNER_ACCESS)]
        public async Task<IActionResult> UpdateExpireAt([FromBody] UpdateWhiteListAttendantExpireDateRequest request)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state in UpdateExpireAt: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
                await _whiteListService.UpdateExpireAtAsync(request, currentUserId);
                return Ok(new { message = MessageKeys.WHITE_LIST_EXPIRE_DATE_UPDATED });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information in UpdateExpireAt for ParkingLotId: {ParkingLotId}, ClientId: {ClientId}", request.ParkingLotId, request.ClientId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating whitelist expire date for ParkingLotId: {ParkingLotId}, ClientId: {ClientId}", request.ParkingLotId, request.ClientId);
                return StatusCode(500, new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Removes a client from the whitelist.
        /// </summary>
        [HttpDelete]
        [Authorize(Policy = Accessibility.PARKING_LOT_OWNER_ACCESS)]
        public async Task<IActionResult> RemoveFromWhiteList([FromBody] RemoveAttendantFromWhiteListRequest request)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state in RemoveFromWhiteList: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
                await _whiteListService.RemoveFromWhiteListAsync(request, currentUserId);
                return Ok(new { message = MessageKeys.CLIENT_REMOVED_FROM_WHITE_LIST });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information in RemoveFromWhiteList for ParkingLotId: {ParkingLotId}, ClientId: {ClientId}", request.ParkingLotId, request.ClientId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing from whitelist for ParkingLotId: {ParkingLotId}, ClientId: {ClientId}", request.ParkingLotId, request.ClientId);
                return StatusCode(500, new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets a list of whitelisted attendants for a parking lot.
        /// </summary>
        [HttpGet]
        [Authorize(Policy = Accessibility.PARKING_LOT_OWNER_ACCESS)]
        public async Task<IActionResult> GetWhiteList([FromQuery] GetWhiteListAttendantListRequest request)
        {
            try
            {
                var result = await _whiteListService.GetWhiteListAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving whitelist for ParkingLotId: {ParkingLotId}", request.ParkingLotId);
                return StatusCode(500, new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }

        /// <summary>
        /// Gets a paginated list of whitelisted attendants for a parking lot.
        /// </summary>
        [HttpGet("page")]
        public async Task<ActionResult<PageResult<WhiteListAttendantDto>>> GetWhiteListPage([FromQuery] PageRequest pageRequest, [FromQuery] GetWhiteListAttendantListRequest request)
        {
            try
            {
                var result = await _whiteListService.GetWhiteListPageAsync(pageRequest, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving paginated whitelist for ParkingLotId: {ParkingLotId}", request.ParkingLotId);
                return StatusCode(500, new { message = MessageKeys.UNEXPECTED_ERROR });
            }
        }
    }
}