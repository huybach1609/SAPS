using SAPS.Api.Models.Generated;

namespace SAPS.Api.Repository
{
    public interface ISubscriptionRepository
    {
        Task<IEnumerable<Subscription>> GetAllSubscriptionsAsync();
        Task<Subscription?> GetSubscriptionByIdAsync(string id);
        Task<Subscription> CreateSubscriptionAsync(Subscription subscription);
        Task<Subscription> UpdateSubscriptionAsync(Subscription subscription);
        Task<IEnumerable<Subscription>> GetSubscriptionsByNameAsync(string name);
        Task<IEnumerable<Subscription>> GetSubscriptionsByDurationAsync(long duration);
        Task<IEnumerable<Subscription>> GetAllSubscriptionsByNameAsync(string name);
        Task DisableSubscriptionsAsync(IEnumerable<Subscription> subscriptions);
    }
}