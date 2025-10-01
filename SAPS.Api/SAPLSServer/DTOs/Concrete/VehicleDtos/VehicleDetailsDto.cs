using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.VehicleDtos
{
    public class VehicleDetailsDto : VehicleSummaryDto
    {
        public string EngineNumber { get; set; }
        public string ChassisNumber { get; set; }
        public string OwnerVehicleFullName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string OwnerId { get; set; }
        public VehicleDetailsDto(Vehicle vehicle) : base(vehicle)
        {
            EngineNumber = vehicle.EngineNumber;
            ChassisNumber = vehicle.ChassisNumber;
            OwnerVehicleFullName = vehicle.CurrentHolder!.User.FullName;
            CreatedAt = vehicle.CreatedAt;
            UpdatedAt = vehicle.UpdatedAt;
            OwnerId = vehicle.OwnerId;
        }
    }
}
