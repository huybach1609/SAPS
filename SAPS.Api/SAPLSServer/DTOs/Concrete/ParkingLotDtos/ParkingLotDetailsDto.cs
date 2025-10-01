using SAPLSServer.DTOs.Concrete.UserDtos;
using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.ParkingLotDtos
{
    public class ParkingLotDetailsDto : ParkingLotSummaryDto
    {
        public ParkingLotOwnerProfileDetailsDto ParkingLotOwner { get; set; }
        public string Settings { get; set; }
        public ParkingLotDetailsDto(ParkingLot parkingLot) : base(parkingLot)
        {
            ParkingLotOwner = new ParkingLotOwnerProfileDetailsDto(parkingLot.ParkingLotOwner);
            Settings = parkingLot.Settings;
        }
    }
}
