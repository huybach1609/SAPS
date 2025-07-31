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
            // Check if user with this email or phone already exists
            var (exists, fieldName) = await _adminRepository.CheckUserExistsByEmailOrPhoneAsync(adminDto.Email, adminDto.Phone);
            if (exists)
            {
                throw new InvalidOperationException($"User with this {fieldName} already exists.");
            }
            
            // Map DTO to user entity
            var user = _mapper.Map<User>(adminDto);

            // Create admin with role ID 1 (Admin) instead of 2 (HeadAdmin)
            var createdAdmin = await _adminRepository.CreateAdminAsync(user, roleId: 1);

            // Map the created admin back to DTO
            return _mapper.Map<AdminResponseDto>(createdAdmin);
        }

        public async Task<bool> DeleteAdminAsync(string id) {
            // Validate that the ID is not empty
            if (string.IsNullOrEmpty(id))
            {
                throw new ArgumentException("Admin ID cannot be empty", nameof(id));
            }
            
            // Call the repository to delete the admin
            return await _adminRepository.DeleteAdminAsync(id);
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