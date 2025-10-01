using System.ComponentModel.DataAnnotations;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;

namespace SAPLSServer.DTOs.Concrete.SubscriptionDtos
{
    public class UpdateSubscriptionStatusRequest : UpdateRequest
    {
        [Required(ErrorMessage = MessageKeys.SUBSCRIPTION_STATUS_REQUIRED)]
        [EnumDataType(typeof(SubscriptionStatus), ErrorMessage = MessageKeys.INVALID_SUBSCRIPTION_STATUS)]
        public string Status { get; set; } = null!;
    }
}