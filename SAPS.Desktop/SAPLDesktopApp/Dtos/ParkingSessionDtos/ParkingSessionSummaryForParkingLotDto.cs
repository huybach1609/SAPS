using SAPLDesktopApp.DTOs.Base;
using System;

namespace SAPLDesktopApp.DTOs.Concrete.ParkingSessionDtos
{
    public class ParkingSessionSummaryForParkingLotDto : GetResult
    {
        public string LicensePlate { get; set; } = null!;
        public DateTime EntryDateTime { get; set; }
        public DateTime? ExitDateTime { get; set; }
        public decimal Cost { get; set; }
        public string Status { get; set; } = null!;
        public string PaymentStatus { get; set; } = null!;
    }
}
