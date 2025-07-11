using SAPS.Api.Models.Generated;

namespace SAPS.Api.Repository
{
    public interface IAdminRepository
    {
        Task<IEnumerable<User>> GetAllAdminsAsync();
        Task<User?> GetAdminByIdAsync(string id);
        Task<User> CreateAdminAsync(User user, string adminId, int roleId = 2);
        
        // Ph??ng th?c m?i ?? qu?n lý Role và Permission
        Task<User?> AssignRolesToUserAsync(string userId, List<int> roleIds);
        Task<User?> RemoveRolesFromUserAsync(string userId, List<int> roleIds);
        Task<List<Role>> GetAllRolesAsync();
        Task<List<Permission>> GetAllPermissionsAsync();
    }
}