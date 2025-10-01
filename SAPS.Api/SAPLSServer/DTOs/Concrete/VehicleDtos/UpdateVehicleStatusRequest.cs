using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.VehicleDtos
{
    public class UpdateVehicleStatusRequest : UpdateRequest
    {
        [Required(ErrorMessage = MessageKeys.VEHICLE_STATUS_REQUIRED)]
        [EnumDataType(typeof(VehicleStatus), ErrorMessage = MessageKeys.INVALID_VEHICLE_STATUS)]
        public string Status { get; set; } = null!;
    }
}
