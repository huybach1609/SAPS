using SAPS.Api.Models.Generated;
using Microsoft.EntityFrameworkCore;

namespace SAPS.Api.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly SapsContext _context;
        
        public UserRepository(SapsContext context)
        {
            _context = context;
        }
        
        public async Task<User> CreateAsync(User user)
        {
            user.CreatedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;
            user.IsActive = true;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User> GetByGoogleIdAsync(string googleId)
        {
            return await _context.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.GoogleId == googleId);
        }

        public async Task<User> GetByIdAsync(string id)
        {
            return await _context.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User> GetByUsernameAsync(string username)
        {
            // Sử dụng email thay cho username
            return await _context.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.Email == username);
        }

        public async Task<IEnumerable<User>> GetUsersByRoleAsync(string roleName)
        {
            // Get all users with the specified role
            return await _context.Users
                .Include(u => u.Roles)
                .Where(u => u.Roles.Any(r => r.Name == roleName))
                .ToListAsync();
        }

        public async Task<User> UpdateAsync(User user)
        {
            var existingUser = await _context.Users.FindAsync(user.Id);
            if (existingUser == null)
                return null;

            // Cập nhật các trường
            existingUser.Email = user.Email;
            existingUser.FullName = user.FullName;
            existingUser.ProfileImageUrl = user.ProfileImageUrl;
            existingUser.IsActive = user.IsActive;
            existingUser.UpdatedAt = DateTime.UtcNow;
            existingUser.GoogleId = user.GoogleId;
            existingUser.Phone = user.Phone;
            
            // Xử lý roles nếu có sự thay đổi
            if (user.Roles != null && user.Roles.Any())
            {
                // Lấy user với roles
                var userWithRoles = await _context.Users
                    .Include(u => u.Roles)
                    .FirstOrDefaultAsync(u => u.Id == user.Id);
                
                if (userWithRoles != null)
                {
                    // Xóa roles hiện tại và thêm roles mới
                    userWithRoles.Roles.Clear();
                    foreach (var role in user.Roles)
                    {
                        userWithRoles.Roles.Add(role);
                    }
                }
            }

            await _context.SaveChangesAsync();
            return existingUser;
        }
    }
}
