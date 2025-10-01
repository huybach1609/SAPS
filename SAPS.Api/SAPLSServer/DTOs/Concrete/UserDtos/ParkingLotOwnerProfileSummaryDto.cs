using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.UserDtos
{
    public class ParkingLotOwnerProfileSummaryDto : UserSummaryDto
    {
        public string ParkingLotOwnerId { get; set; }

        public ParkingLotOwnerProfileSummaryDto(ParkingLotOwnerProfile parkingLotOwner) : base(parkingLotOwner.User)
        {
            ParkingLotOwnerId = parkingLotOwner.ParkingLotOwnerId;
        }
    }
}
