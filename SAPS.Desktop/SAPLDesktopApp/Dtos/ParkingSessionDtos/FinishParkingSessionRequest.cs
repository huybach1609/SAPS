using System.ComponentModel.DataAnnotations;

namespace SAPLDesktopApp.DTOs.Concrete.ParkingSessionDtos
{
    public class FinishParkingSessionRequest
    {
        public string VehicleLicensePlate { get; set; } = null!;
        public string ParkingLotId { get; set; } = null!;
        public byte[] ExitFrontCapture { get; set; } = null!;
        public byte[] ExitBackCapture { get; set; } = null!;
    }
}
