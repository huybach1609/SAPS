using Microsoft.EntityFrameworkCore;
using SAPS.Api.Models.Generated;

namespace SAPS.Api.Repository
{
    public class SubscriptionRepository : ISubscriptionRepository
    {
        private readonly SapsContext _context;

        public SubscriptionRepository(SapsContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Subscription>> GetAllSubscriptionsAsync()
        {
            return await _context.Subscriptions
                .OrderBy(s => s.Name)
                .ToListAsync();
        }

        public async Task<Subscription?> GetSubscriptionByIdAsync(string id)
        {
            return await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<Subscription> CreateSubscriptionAsync(Subscription subscription)
        {
            subscription.Id = Guid.NewGuid().ToString();
            _context.Subscriptions.Add(subscription);
            await _context.SaveChangesAsync();
            return subscription;
        }

        public async Task<Subscription> UpdateSubscriptionAsync(Subscription subscription)
        {
            _context.Subscriptions.Update(subscription);
            await _context.SaveChangesAsync();
            return subscription;
        }

        public async Task<IEnumerable<Subscription>> GetSubscriptionsByNameAsync(string name)
        {
            return await _context.Subscriptions
                .Where(s => s.Name == name && s.Status != "inactive")
                .ToListAsync();
        }

        public async Task<IEnumerable<Subscription>> GetSubscriptionsByDurationAsync(long duration)
        {
            return await _context.Subscriptions
                .Where(s => s.Duration == duration && s.Status != "inactive")
                .ToListAsync();
        }

        public async Task<IEnumerable<Subscription>> GetAllSubscriptionsByNameAsync(string name)
        {
            return await _context.Subscriptions
                .Where(s => s.Name == name)
                .ToListAsync();
        }

        public async Task DisableSubscriptionsAsync(IEnumerable<Subscription> subscriptions)
        {
            foreach (var subscription in subscriptions)
            {
                subscription.Status = "inactive";
            }
            await _context.SaveChangesAsync();
        }
    }
}