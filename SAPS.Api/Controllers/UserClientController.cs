using Microsoft.AspNetCore.Mvc;
using SAPS.Api.Dtos.UserClient;
using SAPS.Api.Service;

namespace SAPS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserClientController : ControllerBase
    {
        private readonly IUserClientService _userClientService;
        private readonly ILogger<UserClientController> _logger;

        public UserClientController(
            IUserClientService userClientService,
            ILogger<UserClientController> logger)
        {
            _userClientService = userClientService;
            _logger = logger;
        }

        /// <summary>
        /// Get all user clients
        /// </summary>
        /// <returns>List of user clients</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserClientResponseDto>>> GetAllUserClients()
        {
            try
            {
                var userClients = await _userClientService.GetAllUserClientsAsync();
                return Ok(userClients);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user client list");
                return StatusCode(500, "An error occurred while retrieving the user client list.");
            }
        }

        /// <summary>
        /// Get user client detail by ID
        /// </summary>
        /// <param name="id">User client ID</param>
        /// <returns>Detailed user client information</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<UserClientDetailDto>> GetUserClientDetailById(string id)
        {
            try
            {
                var userClientDetail = await _userClientService.GetUserClientDetailByIdAsync(id);
                
                if (userClientDetail == null)
                {
                    return NotFound($"User client with ID {id} not found.");
                }
                
                return Ok(userClientDetail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user client detail with ID {UserId}", id);
                return StatusCode(500, "An error occurred while retrieving the user client detail.");
            }
        }

        /// <summary>
        /// Ban user client account
        /// </summary>
        /// <param name="id">User client ID</param>
        /// <returns>Result of ban operation</returns>
        [HttpPut("{id}/banOrUnban")]
        public async Task<ActionResult> BanOrUnbanUserClientAccount(string id)
        {
            try
            {
                var result = await _userClientService.BanOrUnbanUserClientAccountAsync(id);
                
                if (!result)
                {
                    return NotFound($"User client with ID {id} not found.");
                }
                
                return Ok(new { message = "User client account has been banned successfully.", userId = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error banning user client account with ID {UserId}", id);
                return StatusCode(500, "An error occurred while banning the user client account.");
            }
        }
    }
}