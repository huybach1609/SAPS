using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAPS.Api.Dtos;
using SAPS.Api.Service;
using System.Text.Json;

namespace SAPS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Policy = "AdminOnly")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(IAdminService adminService, ILogger<AdminController> logger)
        {
            _adminService = adminService;
            _logger = logger;
        }

        /// <summary>
        /// Get all admins
        /// </summary>
        /// <returns>List of admin users</returns>
        [HttpGet]
        public async Task<ActionResult> GetAllAdmins()
        {
            try
            {
                var admins = await _adminService.GetAllAdminsAsync();
                
                // Transform to simplified format
                var result = admins.Select(a => new {
                    id = a.Id, // Added id field to include the user ID
                    email = a.Email,
                    fullName = a.FullName,
                    role = a.Roles.Any(r => r.Equals("HeadAdmin", StringComparison.OrdinalIgnoreCase)) ? "head_admin" : "admin",
                    status = a.IsActive ? "active" : "suspended",
                    createdAt = a.CreatedAt,
                    updatedAt = a.UpdatedAt
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving admin list");
                return StatusCode(500, "An error occurred while retrieving the admin list.");
            }
        }

        /// <summary>
        /// Get admin by ID
        /// </summary>
        /// <param name="id">Admin user ID</param>
        /// <returns>Admin details</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<AdminResponseDto>> GetAdminById(string id)
        {
            try
            {
                var admin = await _adminService.GetAdminByIdAsync(id);

                if (admin == null)
                {
                    return NotFound($"Admin with ID {id} not found.");
                }

                return Ok(admin);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving admin with ID {AdminId}", id);
                return StatusCode(500, "An error occurred while retrieving the admin.");
            }
        }

        /// <summary>
        /// Create a new admin
        /// </summary>
        /// <param name="adminDto">Admin data</param>
        /// <returns>Created admin</returns>
        [HttpPost]
        public async Task<ActionResult<AdminResponseDto>> CreateAdmin([FromBody] AdminCreateDto adminDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdAdmin = await _adminService.CreateAdminAsync(adminDto);

                return CreatedAtAction(nameof(GetAdminById), new { id = createdAdmin.Id }, createdAdmin);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating admin");
                return StatusCode(500, "An error occurred while creating the admin.");
            }
        }

        /// <summary>
        /// Get all available roles
        /// </summary>
        /// <returns>List of roles</returns>
        [HttpGet("roles")]
        public async Task<ActionResult<IEnumerable<RoleDto>>> GetAllRoles()
        {
            try
            {
                var roles = await _adminService.GetAllRolesAsync();
                return Ok(roles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving roles");
                return StatusCode(500, "An error occurred while retrieving the roles.");
            }
        }

        /// <summary>
        /// Get all available permissions
        /// </summary>
        /// <returns>List of permissions</returns>
        [HttpGet("permissions")]
        public async Task<ActionResult<IEnumerable<PermissionDto>>> GetAllPermissions()
        {
            try
            {
                var permissions = await _adminService.GetAllPermissionsAsync();
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving permissions");
                return StatusCode(500, "An error occurred while retrieving the permissions.");
            }
        }

        /// <summary>
        /// Assign roles to an admin
        /// </summary>
        /// <param name="id">Admin ID</param>
        /// <param name="roleIds">List of role IDs to assign</param>
        /// <returns>Updated admin details</returns>
        [HttpPost("{id}/roles")]
        public async Task<ActionResult<AdminResponseDto>> AssignRolesToAdmin(string id, [FromBody] List<int> roleIds)
        {
            try
            {
                var updatedAdmin = await _adminService.AssignRolesToAdminAsync(id, roleIds);
                return Ok(updatedAdmin);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning roles to admin {AdminId}", id);
                return StatusCode(500, "An error occurred while assigning roles to the admin.");
            }
        }

        /// <summary>
        /// Remove roles from an admin
        /// </summary>
        /// <param name="id">Admin ID</param>
        /// <param name="roleIds">List of role IDs to remove</param>
        /// <returns>Updated admin details</returns>
        [HttpDelete("{id}/roles")]
        public async Task<ActionResult<AdminResponseDto>> RemoveRolesFromAdmin(string id, [FromBody] List<int> roleIds)
        {
            try
            {
                var updatedAdmin = await _adminService.RemoveRolesFromAdminAsync(id, roleIds);
                return Ok(updatedAdmin);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing roles from admin {AdminId}", id);
                return StatusCode(500, "An error occurred while removing roles from the admin.");
            }
        }
    }
}