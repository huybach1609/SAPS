using Microsoft.EntityFrameworkCore;
using SAPS.Api.Models.Generated;

namespace SAPS.Api.Repository
{
    public class AdminRepository : IAdminRepository
    {
        private readonly SapsContext _context;

        public AdminRepository(SapsContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<User>> GetAllAdminsAsync()
        {
            // Get all users with Admin or HeadAdmin roles and include permissions through roles
            return await _context.Users
                .Include(u => u.Roles)
                    .ThenInclude(r => r.Permissions)
                .Where(u => u.Roles.Any(r => r.Name == "Admin" || r.Name == "HeadAdmin"))
                .ToListAsync();
        }

        public async Task<User?> GetAdminByIdAsync(string id)
        {
            // Get user with Admin or HeadAdmin role and include permissions through roles
            return await _context.Users
                .Include(u => u.Roles)
                    .ThenInclude(r => r.Permissions)
                .FirstOrDefaultAsync(u => u.Id == id && u.Roles.Any(r => r.Name == "Admin" || r.Name == "HeadAdmin"));
        }

        public async Task<User> CreateAdminAsync(User user, string adminId, int roleId = 2)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Generate UUID
                user.Id = Guid.NewGuid().ToString();
                
                // Add user
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                
                // Get Admin role with its permissions
                var adminRole = await _context.Roles
                    .Include(r => r.Permissions)
                    .FirstOrDefaultAsync(r => r.Id == roleId);
                
                if (adminRole == null)
                {
                    throw new InvalidOperationException("Admin role not found");
                }
                
                // Add role to user
                user.Roles = new List<Role> { adminRole };
                
                // Set additional user properties
                user.IsActive = true;
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                // Reload the user with roles and permissions for returning
                var createdUser = await _context.Users
                    .Include(u => u.Roles)
                        .ThenInclude(r => r.Permissions)
                    .FirstOrDefaultAsync(u => u.Id == user.Id);
                
                return createdUser ?? user;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<User?> AssignRolesToUserAsync(string userId, List<int> roleIds)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var user = await _context.Users
                    .Include(u => u.Roles)
                        .ThenInclude(r => r.Permissions)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    return null;
                }

                var rolesToAdd = await _context.Roles
                    .Include(r => r.Permissions)
                    .Where(r => roleIds.Contains(r.Id))
                    .ToListAsync();

                foreach (var role in rolesToAdd)
                {
                    if (!user.Roles.Any(r => r.Id == role.Id))
                    {
                        user.Roles.Add(role);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return user;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<User?> RemoveRolesFromUserAsync(string userId, List<int> roleIds)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var user = await _context.Users
                    .Include(u => u.Roles)
                        .ThenInclude(r => r.Permissions)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    return null;
                }

                foreach (var roleId in roleIds)
                {
                    var roleToRemove = user.Roles.FirstOrDefault(r => r.Id == roleId);
                    if (roleToRemove != null)
                    {
                        user.Roles.Remove(roleToRemove);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return user;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<List<Role>> GetAllRolesAsync()
        {
            return await _context.Roles
                .Include(r => r.Permissions)
                .ToListAsync();
        }

        public async Task<List<Permission>> GetAllPermissionsAsync()
        {
            return await _context.Permissions
                .ToListAsync();
        }
    }
}