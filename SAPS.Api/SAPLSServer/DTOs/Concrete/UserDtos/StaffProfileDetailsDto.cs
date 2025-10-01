using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.UserDtos
{
    public class StaffProfileDetailsDto : UserDetailsDto
    {
        public string ParkingLotId { get; set; }
        public string StaffId { get; set; }

        public StaffProfileDetailsDto(StaffProfile staff) : base(staff.User)
        {
            StaffId = staff.StaffId;
            ParkingLotId = staff.ParkingLotId;
        }
    }
}
