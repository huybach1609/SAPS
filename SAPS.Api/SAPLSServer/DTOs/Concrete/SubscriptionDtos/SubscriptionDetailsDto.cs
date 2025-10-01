using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.SubscriptionDtos
{
    public class SubscriptionDetailsDto : SubscriptionSummaryDto
    {
        public SubscriptionDetailsDto(Subscription model) : base(model)
        {
        }
    }
}