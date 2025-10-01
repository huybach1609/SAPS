using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.ParkingLotDtos
{
    public class ParkingLotDetailsForOwner : ParkingLotDetailsDto
    {
        public DateTime ExpiredAt { get; set; }
        public ParkingLotDetailsForOwner(ParkingLot parkingLot) : base(parkingLot)
        {
            ExpiredAt = parkingLot.ExpiredAt;
        }
    }
}
