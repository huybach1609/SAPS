using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.UserDtos
{
    public class StaffProfileSummaryDto : UserSummaryDto
    {
        public string StaffId { get; set; }
        public string ParkingLotId { get; set; }

        public StaffProfileSummaryDto(StaffProfile staff) : base(staff.User)
        {
            StaffId = staff.StaffId;
            ParkingLotId = staff.ParkingLotId;
        }
    }
}
