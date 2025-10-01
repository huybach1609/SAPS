using Microsoft.Identity.Client;
using SAPLSServer.Constants;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.UserDtos
{
    public class CreateStaffProfileRequest : CreateUserRequest
    {
        [Required(ErrorMessage = MessageKeys.STAFF_PROFILE_ID_REQUIRED)]
        public string StaffId { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.PARKING_LOT_ID_REQUIRED)]
        public string ParkingLotId { get; set; } = null!;
    }
}
