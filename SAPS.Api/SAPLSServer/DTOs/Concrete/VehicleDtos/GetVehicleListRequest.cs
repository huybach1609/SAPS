using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.VehicleDtos
{
    public class GetVehicleListRequest : GetListRequest
    {
        [Required(ErrorMessage = MessageKeys.OWNER_ID_REQUIRED)] // Fix: was PARKING_LOT_ID_REQUIRED
        public string OwnerId { get; set; } = string.Empty;
        
        [EnumDataType(typeof(VehicleStatus), ErrorMessage = MessageKeys.INVALID_VEHICLE_STATUS)]
        public string? Status { get; set; }
        
        [EnumDataType(typeof(VehicleSharingStatus), ErrorMessage = MessageKeys.INVALID_VEHICLE_SHARING_STATUS)]
        public string? SharingStatus { get; set; }
    }
}
