using SAPS.Api.Dtos.UserClient;

namespace SAPS.Api.Repository
{
    public interface IUserClientRepository
    {
        Task<IEnumerable<UserClientResponseDto>> GetAllUserClientsAsync();
        Task<UserClientDetailDto?> GetUserClientDetailByIdAsync(string id);
        Task<bool> BanOrUnbanUserClientAccountAsync(string id);
    }
}