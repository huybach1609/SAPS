using SAPS.Api.Dtos;

namespace SAPS.Api.Service
{
    public interface IAdminService
    {
        Task<IEnumerable<AdminResponseDto>> GetAllAdminsAsync();
        Task<AdminResponseDto?> GetAdminByIdAsync(string id);
        Task<AdminResponseDto> CreateAdminAsync(AdminCreateDto adminDto);
        
        // Ph??ng th?c m?i ?? qu?n lý Role và Permission
        Task<AdminResponseDto> AssignRolesToAdminAsync(string adminId, List<int> roleIds);
        Task<AdminResponseDto> RemoveRolesFromAdminAsync(string adminId, List<int> roleIds);
        Task<List<RoleDto>> GetAllRolesAsync();
        Task<List<PermissionDto>> GetAllPermissionsAsync();
    }
}