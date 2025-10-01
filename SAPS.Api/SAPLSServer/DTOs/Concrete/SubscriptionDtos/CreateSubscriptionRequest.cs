using SAPLSServer.Constants;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.SubscriptionDtos
{
    public class CreateSubscriptionRequest
    {
        [Required(ErrorMessage = MessageKeys.SUBSCRIPTION_NAME_REQUIRED)]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = MessageKeys.SUBSCRIPTION_DURATION_REQUIRED)]
        [Range(minimum: 1, maximum: double.PositiveInfinity, 
            ErrorMessage = MessageKeys.SUBSCRIPTION_DURATION_INVALID)]
        public int Duration { get; set; }

        [Required(ErrorMessage = MessageKeys.SUBSCRIPTION_DURATION_REQUIRED)]
        [Range(minimum: 1, maximum: double.PositiveInfinity, 
            ErrorMessage = MessageKeys.SUBSCRIPTION_PRICE_INVALID)]
        public double Price { get; set; }

        [Required(ErrorMessage = MessageKeys.SUBSCRIPTION_STATUS_REQUIRED)]
        [EnumDataType(typeof(SubscriptionStatus), 
            ErrorMessage = MessageKeys.INVALID_SUBSCRIPTION_STATUS)]
        public string Status { get; set; } = null!;

        public string? Note { get; set; }
    }
}