using AutoMapper;
using SAPS.Api.Dtos.UserClient;
using SAPS.Api.Repository;

namespace SAPS.Api.Service {
    public class UserClientService : IUserClientService {
        private readonly IUserRepository _userRepository;
        private readonly IUserClientRepository _userClientRepository;
        private readonly IMapper _mapper;

        public UserClientService(IUserRepository userRepository, IUserClientRepository userClientRepository, IMapper mapper) {
            _userClientRepository = userClientRepository;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<UserClientResponseDto>> GetAllUserClientsAsync() {
            // Get users with "user_client" role
            var userClients = await _userRepository.GetUsersByRoleAsync("user_client");

            // Map to response DTOs
            var response = userClients.Select(client => new UserClientResponseDto {
                Id = client.Id,
                FullName = client.FullName,
                Email = client.Email,
                CreatedAt = client.CreatedAt.ToString("MMM d, yyyy"),
                Status = client.IsActive ? "active" : "inactive"
            });

            return response;
        }
        public async Task<UserClientDetailDto?> GetUserClientDetailByIdAsync(string id) {
            return await _userClientRepository.GetUserClientDetailByIdAsync(id);
        }

        public async Task<bool> BanOrUnbanUserClientAccountAsync(string id) {
            return await _userClientRepository.BanOrUnbanUserClientAccountAsync(id);
        }
    }
}