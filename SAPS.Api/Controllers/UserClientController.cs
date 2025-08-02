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
    }
}