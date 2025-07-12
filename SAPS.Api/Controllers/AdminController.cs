using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SAPS.Api.Dtos;
using SAPS.Api.Models.Generated;
using SAPS.Api.Repository;
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
        private readonly IAdminRepository _adminRepository;
        private readonly ILogger<AdminController> _logger;
        private readonly SapsContext _context; // Added context for direct database access

        public AdminController(
            IAdminService adminService, 
            IAdminRepository adminRepository,
            ILogger<AdminController> logger, 
            SapsContext context)
        {
            _adminService = adminService;
            _adminRepository = adminRepository;
            _logger = logger;
            _context = context;
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
                    id = a.Id,
                    email = a.Email,
                    fullName = a.FullName,
                    // Simply use the Role property from the DTO which is already properly set
                    // in the MappingProfile to distinguish between admin and head_admin
                    role = a.Role,
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
        /// Debug endpoint to check roles directly
        /// </summary>
        [HttpGet("debug/roles")]
        public async Task<ActionResult> GetRolesDebug()
        {
            try
            {
                // Get all roles in the system
                var roles = await _context.Roles.ToListAsync();
                
                // Get users with Admin role (ID 1)
                var adminUsers = await _context.Users
                    .Include(u => u.Roles)
                    .Where(u => u.Roles.Any(r => r.Id == 1))
                    .Select(u => new { u.Id, u.Email, u.FullName, RoleIds = u.Roles.Select(r => r.Id).ToList() })
                    .ToListAsync();
                
                // Get users with HeadAdmin role (ID 2)
                var headAdminUsers = await _context.Users
                    .Include(u => u.Roles)
                    .Where(u => u.Roles.Any(r => r.Id == 2))
                    .Select(u => new { u.Id, u.Email, u.FullName, RoleIds = u.Roles.Select(r => r.Id).ToList() })
                    .ToListAsync();
                
                // Return debug information
                return Ok(new {
                    AllRoles = roles.Select(r => new { r.Id, r.Name }),
                    AdminUsersCount = adminUsers.Count,
                    HeadAdminUsersCount = headAdminUsers.Count,
                    AdminUsers = adminUsers,
                    HeadAdminUsers = headAdminUsers
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in debug endpoint");
                return StatusCode(500, "An error occurred: " + ex.Message);
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
        /// Delete an admin by ID
        /// </summary>
        /// <param name="id">Admin user ID</param>
        /// <returns>Status of the delete operation</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAdmin(string id)
        {
            try
            {
                // Check if the admin exists first
                var admin = await _adminService.GetAdminByIdAsync(id);
                if (admin == null)
                {
                    return NotFound($"Admin with ID {id} not found.");
                }

                // Attempt to delete the admin
                var result = await _adminService.DeleteAdminAsync(id);
                if (result)
                {
                    return Ok(new { message = $"Admin with ID {id} was successfully deleted." });
                }
                else
                {
                    return BadRequest(new { error = "Failed to delete admin. The user may not be an admin or there was an issue with the operation." });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting admin with ID {AdminId}", id);
                return StatusCode(500, $"An error occurred while deleting the admin: {ex.Message}");
            }
        }

        /// <summary>
        /// Check if email or phone already exists in the system
        /// </summary>
        /// <param name="email">Email to check</param>
        /// <param name="phone">Phone to check</param>
        /// <returns>Status indicating if the email or phone exists</returns>
        [HttpGet("validate")]
        public async Task<ActionResult> ValidateEmailAndPhone([FromQuery] string email, [FromQuery] string phone)
        {
            try
            {
                var (exists, fieldName) = await _adminRepository.CheckUserExistsByEmailOrPhoneAsync(email, phone);
                if (exists)
                {
                    return BadRequest(new { field = fieldName, error = $"User with this {fieldName} already exists." });
                }

                return Ok(new { isValid = true, message = "Email and phone are available." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating email and phone");
                return StatusCode(500, "An error occurred while validating email and phone.");
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

                // Check if email or phone already exists
                var (exists, fieldName) = await _adminRepository.CheckUserExistsByEmailOrPhoneAsync(adminDto.Email, adminDto.Phone);
                if (exists)
                {
                    return BadRequest(new { field = fieldName, error = $"User with this {fieldName} already exists." });
                }

                var createdAdmin = await _adminService.CreateAdminAsync(adminDto);

                return CreatedAtAction(nameof(GetAdminById), new { id = createdAdmin.Id }, createdAdmin);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("already exists"))
            {
                // Extract field name from exception message
                var fieldName = ex.Message.Contains("Email") ? "Email" : "Phone";
                return BadRequest(new { field = fieldName, error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating admin");
                return StatusCode(500, "An error occurred while creating the admin.");
            }
        }

        /// <summary>
        /// Create a head admin user directly
        /// </summary>
        [HttpPost("create-head-admin")]
        public async Task<ActionResult> CreateHeadAdmin([FromBody] AdminCreateDto adminDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                
                // Check if email or phone already exists
                var (exists, fieldName) = await _adminRepository.CheckUserExistsByEmailOrPhoneAsync(adminDto.Email, adminDto.Phone);
                if (exists)
                {
                    return BadRequest(new { field = fieldName, error = $"User with this {fieldName} already exists." });
                }
                
                // Create the user first
                var user = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Email = adminDto.Email,
                    FullName = adminDto.FullName,
                    Phone = adminDto.Phone,
                    Password = "headmin", // Default password
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                
                // Find the HeadAdmin role (ID 2)
                var headAdminRole = await _context.Roles.FindAsync(2);
                
                // If role doesn't exist, create it
                if (headAdminRole == null)
                {
                    headAdminRole = new Role { Id = 2, Name = "HeadAdmin" };
                    _context.Roles.Add(headAdminRole);
                    await _context.SaveChangesAsync();
                }
                
                // Add the role to the user
                var userWithRoles = await _context.Users
                    .Include(u => u.Roles)
                    .FirstOrDefaultAsync(u => u.Id == user.Id);
                    
                if (userWithRoles != null)
                {
                    userWithRoles.Roles.Add(headAdminRole);
                    await _context.SaveChangesAsync();
                }
                
                return Ok(new { 
                    message = "Head admin created successfully", 
                    userId = user.Id,
                    roleId = headAdminRole.Id,
                    roleName = headAdminRole.Name
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating head admin");
                return StatusCode(500, "An error occurred while creating the head admin: " + ex.Message);
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