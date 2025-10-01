using SAPLSServer.Constants;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.SharedVehicleDtos
{
    public class CreateSharedVehicleRequest
    {
        [Required(ErrorMessage = MessageKeys.VEHICLE_ID_REQUIRED)]
        public string VehicleId { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.OWNER_ID_REQUIRED)]
        public string OwnerId { get; set; } = null!;
        public string? Note { get; set; }
        [Required(ErrorMessage = MessageKeys.SHARED_PERSON_ID_REQUIRED)]
        public string SharedPersonId { get; set; } = null!;
    }
}
