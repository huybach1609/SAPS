using System;

namespace SAPLDesktopApp.DTOs.Concrete.VehicleDtos
{
    public class VehicleDetailsDto : VehicleSummaryDto
    {
        public string EngineNumber { get; set; } = null!;
        public string ChassisNumber { get; set; } = null!;
        public string OwnerVehicleFullName { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string OwnerId { get; set; } = null!;

    }
}
