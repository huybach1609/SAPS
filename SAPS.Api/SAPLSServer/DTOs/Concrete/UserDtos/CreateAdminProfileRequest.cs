using SAPLSServer.Constants;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.UserDtos
{
    public class CreateAdminProfileRequest : CreateUserRequest
    {
        [Required(ErrorMessage = MessageKeys.ADMIN_PROFILE_ID_REQUIRED)]
        public string AdminId { get; set; } = null!;
    }
}
