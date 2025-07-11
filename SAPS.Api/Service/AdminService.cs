using AutoMapper;
using SAPS.Api.Dtos;
using SAPS.Api.Models.Generated;
using SAPS.Api.Repository;

namespace SAPS.Api.Service {
    public class AdminService : IAdminService {
        private readonly IAdminRepository _adminRepository;
        private readonly IMapper _mapper;

        public AdminService(IAdminRepository adminRepository, IMapper mapper) {
            _adminRepository = adminRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<AdminResponseDto>> GetAllAdminsAsync() {
            var admins = await _adminRepository.GetAllAdminsAsync();
            return _mapper.Map<IEnumerable<AdminResponseDto>>(admins);
        }

        public async Task<AdminResponseDto?> GetAdminByIdAsync(string id) {
            var admin = await _adminRepository.GetAdminByIdAsync(id);
            return admin != null ? _mapper.Map<AdminResponseDto>(admin) : null;
        }

        public async Task<AdminResponseDto> CreateAdminAsync(AdminCreateDto adminDto) {
            // Map DTO to user entity
            var user = _mapper.Map<User>(adminDto);

            // Generate a unique admin ID
            string adminId = "ADM" + DateTime.Now.ToString("yyyyMMddHHmmss");

            // Create admin with default password "admin" and role ID 2 (Admin)
            var createdAdmin = await _adminRepository.CreateAdminAsync(user, adminId, 2);

            // Map the created admin back to DTO
            return _mapper.Map<AdminResponseDto>(createdAdmin);
        }

        public async Task<AdminResponseDto> AssignRolesToAdminAsync(string adminId, List<int> roleIds) {
            var updatedAdmin = await _adminRepository.AssignRolesToUserAsync(adminId, roleIds);

            if (updatedAdmin == null) {
                throw new KeyNotFoundException($"Admin with ID {adminId} not found");
            }

            return _mapper.Map<AdminResponseDto>(updatedAdmin);
        }

        public async Task<AdminResponseDto> RemoveRolesFromAdminAsync(string adminId, List<int> roleIds) {
            var updatedAdmin = await _adminRepository.RemoveRolesFromUserAsync(adminId, roleIds);

            if (updatedAdmin == null) {
                throw new KeyNotFoundException($"Admin with ID {adminId} not found");
            }

            return _mapper.Map<AdminResponseDto>(updatedAdmin);
        }

        public async Task<List<RoleDto>> GetAllRolesAsync() {
            var roles = await _adminRepository.GetAllRolesAsync();
            return _mapper.Map<List<RoleDto>>(roles);
        }

        public async Task<List<PermissionDto>> GetAllPermissionsAsync() {
            var permissions = await _adminRepository.GetAllPermissionsAsync();
            return _mapper.Map<List<PermissionDto>>(permissions);
        }
    }
}