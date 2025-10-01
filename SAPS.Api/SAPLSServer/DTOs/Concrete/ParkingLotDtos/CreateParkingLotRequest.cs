using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;
using SAPLSServer.Constants;

namespace SAPLSServer.DTOs.Concrete.ParkingLotDtos
{
    public class CreateParkingLotRequest
    {
        [Required(ErrorMessage = MessageKeys.PARKING_LOT_OWNER_ID_REQUIRED)]
        public string ParkingLotOwnerId { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.SUBSCRIPTION_ID_REQUIRED)]
        public string SubscriptionId { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.PARKING_LOT_NAME_REQUIRED)]
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.PLACE_OF_RESIDENCE_REQUIRED)]
        public string Address { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.NUMBER_OF_PARKING_SLOTS_REQUIRED)]
        [Range(1, int.MaxValue, ErrorMessage = MessageKeys.INVALID_NUMBER_OF_PARKING_SLOTS)]
        public int TotalParkingSlot { get; set; }
    }
}
