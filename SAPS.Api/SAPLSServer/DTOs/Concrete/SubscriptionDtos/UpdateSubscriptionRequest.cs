using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.SubscriptionDtos
{
    public class UpdateSubscriptionRequest : UpdateRequest
    {
        [Required(ErrorMessage = MessageKeys.SUBSCRIPTION_NAME_REQUIRED)]
        public string Name { get; set; } = null!;
        public string? Note { get; set; }
        [Required(ErrorMessage = MessageKeys.SUBSCRIPTION_DURATION_REQUIRED)]
        public int Duration { get; set; }
        [Required(ErrorMessage = MessageKeys.SUBSCRIPTION_PRICE_REQUIRED)]
        [Range(0, double.MaxValue, ErrorMessage = MessageKeys.INVALID_SUBSCRIPTION_PRICE)]
        public double Price { get; set; }
        [EnumDataType(typeof(SubscriptionStatus), ErrorMessage = MessageKeys.INVALID_SUBSCRIPTION_STATUS)]
        public string Status { get; set; } = null!;
    }
}
