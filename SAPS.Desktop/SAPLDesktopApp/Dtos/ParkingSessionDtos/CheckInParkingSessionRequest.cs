namespace SAPLDesktopApp.DTOs.Concrete.ParkingSessionDtos
{
    public class CheckInParkingSessionRequest
    {
        public string? VehicleType { get; set; }
        public string VehicleLicensePlate { get; set; } = null!;
        public string ParkingLotId { get; set; } = null!;
        public byte[] EntryFrontCapture { get; set; } = null!;
        public byte[] EntryBackCapture { get; set; } = null!;
    }
}
