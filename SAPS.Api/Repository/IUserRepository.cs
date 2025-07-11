using SAPS.Api.Models.Generated;

namespace SAPS.Api.Repository
{
    public interface IUserRepository
    {
        Task<User> GetByIdAsync(string id);
        Task<User> GetByUsernameAsync(string username);
        Task<User> GetByGoogleIdAsync(string googleId);
        Task<User> CreateAsync(User user);
        Task<User> UpdateAsync(User user);
    }
}
