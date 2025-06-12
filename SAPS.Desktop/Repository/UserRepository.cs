using SAPS.Desktop.Models;
using Microsoft.EntityFrameworkCore;
using SAPS.Desktop.Entity;

namespace SAPS.Desktop.Repository

{
    public class UserRepository : IUserRepository
    {
        private readonly SaspContext _context;
        public UserRepository(SaspContext context)
        {
            _context = context;
        }
        public async Task<User> CreateAsync(User user)
        {
            user.CreatedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User> GetByGoogleIdAsync(string googleId)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId);
        }

        public async Task<User> GetByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<User> GetByUsernameAsync(string username)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<User> UpdateAsync(User user)
        {
            var existingUser = await _context.Users.FindAsync(user.UserId);
            if (existingUser == null)
                return null;

            // Update fields
            existingUser.Username = user.Username;
            existingUser.Email = user.Email;
            existingUser.Name = user.Name;
            existingUser.ProfilePictureUrl = user.ProfilePictureUrl;
            existingUser.IsActive = user.IsActive;
            existingUser.Role = user.Role;
            existingUser.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existingUser;
        }
    }
}
