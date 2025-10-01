using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.VehicleDtos
{
    public class UpdateVehicleSharingStatusRequest : UpdateRequest
    {
        [Required(ErrorMessage = MessageKeys.SHARING_STATUS_REQUIRED)]
        [EnumDataType(typeof(VehicleSharingStatus), ErrorMessage = MessageKeys.INVALID_VEHICLE_SHARING_STATUS)]
        public string SharingStatus { get; set; } = null!;
    }
}
