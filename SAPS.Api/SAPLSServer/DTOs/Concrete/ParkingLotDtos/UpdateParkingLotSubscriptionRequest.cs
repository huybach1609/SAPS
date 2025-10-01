using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.ParkingLotDtos
{
    public class UpdateParkingLotSubscriptionRequest : UpdateRequest
    {
        [Required(ErrorMessage = MessageKeys.SUBSCRIPTION_ID_REQUIRED)]
        public string SubscriptionId { get; set; } = null!;
    }
}
