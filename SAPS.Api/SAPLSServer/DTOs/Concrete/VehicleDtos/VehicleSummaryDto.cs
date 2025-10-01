using SAPLSServer.DTOs.Base;
using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.VehicleDtos
{
    public class VehicleSummaryDto : GetResult
    {
        public string LicensePlate { get; set; }
        public string Brand { get; set; }
        public string Model { get; set; }
        public string Color { get; set; }
        public string Status { get; set; }
        public string SharingStatus { get; set; }
        public string VehicleType { get; set; }
        public VehicleSummaryDto(Vehicle vehicle)
        {
            Id = vehicle.Id;
            LicensePlate = vehicle.LicensePlate;
            Brand = vehicle.Brand;
            Model = vehicle.Model;
            Color = vehicle.Color;
            Status = vehicle.Status;
            SharingStatus = vehicle.SharingStatus;
            VehicleType = vehicle.VehicleType;
        }
    }
}
