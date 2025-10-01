using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.SubscriptionDtos
{
    public class SubscriptionSummaryDto
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public long Duration { get; set; }
        public double Price { get; set; }
        public string Status { get; set; } = null!;
        public string? UpdatedBy { get; set; }
        public string? Description { get; set; }
        public SubscriptionSummaryDto(Subscription model)
        {
            Id = model.Id;
            Name = model.Name;
            Duration = model.Duration;
            Price = model.Price;
            Status = model.Status;
            UpdatedBy = model.UpdatedByNavigation?.User.FullName;
            Description = model.Description;
        }
    }
}