using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.UserDtos
{
    public class UpdateStaffProfileRequest : UpdateRequest
    {
        [Required(ErrorMessage = MessageKeys.STAFF_PROFILE_ID_REQUIRED)]
        public string StaffId { get; set; } = null!;
    }
}
