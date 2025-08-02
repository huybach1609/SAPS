using SAPS.Api.Models.Generated;

namespace SAPS.Api.Repository
{
    public interface IAdminRepository
    {
        Task<IEnumerable<User>> GetAllAdminsAsync();
        Task<User?> GetAdminByIdAsync(string id);
        Task<User> CreateAdminAsync(User user, int roleId = 1);
        Task<bool> DeleteAdminAsync(string id);
        Task<(bool Exists, string FieldName)> CheckUserExistsByEmailOrPhoneAsync(string email, string phone);
        
        // Ph??ng th?c qu?n lý Role và Permission
        Task<User?> AssignRolesToUserAsync(string userId, List<int> roleIds);
        Task<User?> RemoveRolesFromUserAsync(string userId, List<int> roleIds);
        Task<List<Role>> GetAllRolesAsync();
        Task<List<Permission>> GetAllPermissionsAsync();
    }
}