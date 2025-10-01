using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.SubscriptionDtos
{
    public class GetSubscriptionListRequest : GetListRequest
    {
        [EnumDataType(typeof(SubscriptionStatus), ErrorMessage = MessageKeys.INVALID_SUBSCRIPTION_STATUS)]
        public string? Status { get; set; }
    }
}