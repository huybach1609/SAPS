using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.ParkingSessionDtos
{
    public class ParkingSessionSummaryForClientDto : ParkingSessionSummaryForParkingLotDto
    {
        public string ParkingLotName { get; set; }
        public ParkingSessionSummaryForClientDto(ParkingSession parkingSession) : base(parkingSession)
        {
            ParkingLotName = parkingSession.ParkingLot?.Name ?? string.Empty;
        }
    }
}
