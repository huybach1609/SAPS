using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.UserDtos
{
    public class UpdateAdminProfileRequest : UpdateRequest
    {
        [Required(ErrorMessage = MessageKeys.ADMIN_PROFILE_ID_REQUIRED)]
        public string AdminId { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.ADMIN_ROLE_REQUIRED)]
        [EnumDataType(typeof(AdminRole), ErrorMessage = MessageKeys.INVALID_ADMIN_ROLE)]
        public string AdminRole { get; set; } = null!;
    }
}
