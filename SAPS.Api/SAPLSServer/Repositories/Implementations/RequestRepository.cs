using Microsoft.EntityFrameworkCore;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Implementations
{
    public class RequestRepository : Repository<Request, string>, IRequestRepository
    {
        public RequestRepository(SaplsContext context) : base(context)
        {
        }



        public async Task<Request?> FindIncludingSenderAndLastUpdater(string id)
        {
            return await _dbSet.Include(r => r.Sender).Include(r => r.UpdatedByNavigation)
                           .AsNoTracking()
                           .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        public async Task<Request?> FindIncludingSenderAndLastUpdaterReadOnly(string id)
        {
            return await _dbSet.Include(r => r.Sender).Include(r => r.UpdatedByNavigation).ThenInclude(a => a!.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        public async Task<Request?> FindIncludingSender(string id)
        {
            return await _dbSet.Include(r => r.Sender).FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        public async Task<Request?> FindIncludingSenderReadOnly(string id)
        {
            return await _dbSet.Include(r => r.Sender)
                .AsNoTracking()
                .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        protected override Expression<Func<Request, bool>> CreateIdPredicate(string id)
        {
            return r => r.Id == id;
        }
    }
}
