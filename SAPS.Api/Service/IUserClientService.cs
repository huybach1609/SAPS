using SAPS.Api.Dtos.UserClient;

namespace SAPS.Api.Service
{
    public interface IUserClientService
    {
        Task<IEnumerable<UserClientResponseDto>> GetAllUserClientsAsync();
    }
}