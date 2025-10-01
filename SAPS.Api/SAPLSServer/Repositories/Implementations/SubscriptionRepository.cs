using Microsoft.EntityFrameworkCore;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Implementations
{
    public class SubscriptionRepository : Repository<Subscription, string>, ISubscriptionRepository
    {
        public SubscriptionRepository(SaplsContext context) : base(context)
        {
        }

        public async Task<Subscription?> FindIncludUpdatedBy(string id)
        {
            return await _dbSet.Include(s => s.UpdatedByNavigation).ThenInclude(u => u!.User)
                               .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        public async Task<Subscription?> FindIncludUpdatedByReadOnly(string id)
        {
            return await _dbSet.Include(s => s.UpdatedByNavigation).ThenInclude(u => u!.User)
                .AsNoTracking().FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        protected override Expression<Func<Subscription, bool>> CreateIdPredicate(string id)
        {
            return s => s.Id == id;
        }
    }
}