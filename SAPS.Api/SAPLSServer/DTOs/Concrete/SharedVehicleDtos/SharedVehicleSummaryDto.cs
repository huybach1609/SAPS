using SAPLSServer.DTOs.Concrete.VehicleDtos;
using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.SharedVehicleDtos
{
    public class SharedVehicleSummaryDto : VehicleSummaryDto
    {
        public int? AccessDuration { get; set; }
        public string OwnerName { get; set; }
        public SharedVehicleSummaryDto(SharedVehicle sharedVehicle) : base(sharedVehicle.Vehicle)
        {
            AccessDuration = sharedVehicle.AccessDuration;
            OwnerName = sharedVehicle.Vehicle.Owner.User.FullName;
            Id = sharedVehicle.Id;
        }
    }
}
