using SAPLDesktopApp.DTOs.Base;

namespace SAPLDesktopApp.DTOs.Concrete.VehicleDtos
{
    public class VehicleSummaryDto : GetResult
    {
        public string LicensePlate { get; set; } = null!;
        public string Brand { get; set; } = null!;
        public string Model { get; set; } = null!;
        public string Color { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string SharingStatus { get; set; } = null!;
        public string VehicleType { get; set; } = null!;
    }
}
