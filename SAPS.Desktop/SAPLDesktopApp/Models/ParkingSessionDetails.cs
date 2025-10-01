

namespace SAPLDesktopApp.Models
{
    public class ParkingSessionDetails : ParkingSessionItem
    {
        public VehicleSummary Vehicle { get; set; } = new();
        public ClientSummary Owner { get; set; } = new();
        public string PaymentMethod { get; set; } = string.Empty;
        public string EntryFrontCaptureUrl { get; set; } = string.Empty;
        public string EntryBackCaptureUrl { get; set; } = string.Empty;
        public string? ExitFrontCaptureUrl { get; set; }
        public string? ExitBackCaptureUrl { get; set; }
    }
}
