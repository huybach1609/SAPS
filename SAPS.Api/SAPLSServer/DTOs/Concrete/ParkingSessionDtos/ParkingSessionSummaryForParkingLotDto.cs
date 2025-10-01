using SAPLSServer.DTOs.Base;
using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.ParkingSessionDtos
{
    public class ParkingSessionSummaryForParkingLotDto : GetResult
    {
        public string LicensePlate { get; set; }
        public DateTime EntryDateTime { get; set; }
        public DateTime? ExitDateTime { get; set; }
        public decimal Cost { get; set; }
        public string Status { get; set; }
        public string PaymentStatus { get; set; }
        public ParkingSessionSummaryForParkingLotDto(ParkingSession parkingSession)
        {
            Id = parkingSession.Id;
            LicensePlate = parkingSession.LicensePlate;
            EntryDateTime = parkingSession.EntryDateTime;
            ExitDateTime = parkingSession.ExitDateTime;
            Cost = parkingSession.Cost;
            Status = parkingSession.Status;
            PaymentStatus = parkingSession.PaymentStatus;
        }
    }
}
