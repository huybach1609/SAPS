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
                .Where(u => u.Roles.Any(r => r.Name == "admin" || r.Name == "head_admin"))
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

        // Check if email or phone already exists in the database
        public async Task<(bool Exists, string FieldName)> CheckUserExistsByEmailOrPhoneAsync(string email, string phone)
        {
            if (await _context.Users.AnyAsync(u => u.Email == email))
            {
                return (true, "Email");
            }

            if (await _context.Users.AnyAsync(u => u.Phone == phone))
            {
                return (true, "Phone");
            }

            return (false, string.Empty);
        }

        public async Task<User> CreateAdminAsync(User user, int roleId = 1)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Check if user with this email or phone already exists
                var (exists, fieldName) = await CheckUserExistsByEmailOrPhoneAsync(user.Email, user.Phone);
                if (exists)
                {
                    throw new InvalidOperationException($"User with this {fieldName} already exists.");
                }

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

        public async Task<bool> DeleteAdminAsync(string id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Get the user with their roles
                var user = await _context.Users
                    .Include(u => u.Roles)
                    .FirstOrDefaultAsync(u => u.Id == id);

                if (user == null)
                {
                    return false;
                }

                // Check if the user is an admin or head admin
                bool isAdmin = user.Roles.Any(r => r.Name == "Admin" || r.Name == "HeadAdmin" || r.Id == 1 || r.Id == 2);
                
                if (!isAdmin)
                {
                    return false;
                }

                // Clear role associations first (many-to-many relationship)
                user.Roles.Clear();
                await _context.SaveChangesAsync();
                
                // Check and delete related profiles if they exist
                if (user.ClientProfile != null)
                {
                    _context.ClientProfiles.Remove(user.ClientProfile);
                }
                
                if (user.StaffProfile != null)
                {
                    _context.StaffProfiles.Remove(user.StaffProfile);
                }
                
                if (user.ParkingLotOwnerProfile != null)
                {
                    _context.ParkingLotOwnerProfiles.Remove(user.ParkingLotOwnerProfile);
                }
                
                // Delete the user
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                return true;
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