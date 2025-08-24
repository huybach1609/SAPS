using SAPS.Api.Dtos.UserClient;

namespace SAPS.Api.Service
{
    public interface IUserClientService
    {
        Task<IEnumerable<UserClientResponseDto>> GetAllUserClientsAsync();
        Task<UserClientDetailDto?> GetUserClientDetailByIdAsync(string id);
        Task<bool> BanOrUnbanUserClientAccountAsync(string id);
    }
}