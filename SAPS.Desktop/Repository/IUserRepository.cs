using SAPS.Desktop.Models;

namespace SAPS.Desktop.Repository
{
    public interface IUserRepository
    {
        Task<User> GetByIdAsync(int id);
        Task<User> GetByUsernameAsync(string username);
        Task<User> GetByGoogleIdAsync(string googleId);
        Task<User> CreateAsync(User user);
        Task<User> UpdateAsync(User user);
    }
}
