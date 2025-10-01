using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.ParkingLotDtos
{
    public class UpdateParkingLotBasicInformationRequest : UpdateRequest
    {
        [Required(ErrorMessage = MessageKeys.PARKING_LOT_NAME_REQUIRED)]
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        [Required(ErrorMessage = MessageKeys.NUMBER_OF_PARKING_SLOTS_REQUIRED)]
        [Range(1, int.MaxValue, ErrorMessage = MessageKeys.INVALID_NUMBER_OF_PARKING_SLOTS)]
        public int TotalParkingSlot { get; set; }
        [Required(ErrorMessage = "Settings are required.")]
        public string Settings { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.STATUS_REQUIRED)]
        [EnumDataType(typeof(ParkingLotStatus), ErrorMessage = MessageKeys.INVALID_PARKING_LOT_STATUS)]
        public string Status { get; set; } = null!;

    }
}
