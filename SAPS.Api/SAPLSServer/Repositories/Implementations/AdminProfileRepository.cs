using Microsoft.EntityFrameworkCore;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Implementations
{
    public class AdminProfileRepository : Repository<AdminProfile, string>, IAdminProfileRepository
    {
        public AdminProfileRepository(SaplsContext context) : base(context) { }

        public async Task<AdminProfile?> FindIncludingUser(string userId)
        {
            return await _dbSet.Include(ad => ad.User).FirstOrDefaultAsync(CreateIdPredicate(userId));
        }

        public async Task<AdminProfile?> FindIncludingUserReadOnly(string userId)
        {
            return await _dbSet.Include(ad => ad.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(CreateIdPredicate(userId));
        }

        public async Task<AdminProfile?> FindIncludingUser(Expression<Func<AdminProfile, bool>>[] criterias)
        {
            var query = _dbSet.Include(ad => ad.User).AsQueryable();
            query = ApplyFilters(query, criterias);
            return await query.FirstOrDefaultAsync();
        }

        public async Task<AdminProfile?> FindIncludingUserReadOnly(Expression<Func<AdminProfile, bool>>[] criterias)
        {
            var query = _dbSet.Include(ad => ad.User).AsNoTracking();
            query = ApplyFilters(query, criterias);
            return await query.FirstOrDefaultAsync();
        }

        protected override Expression<Func<AdminProfile, bool>> CreateIdPredicate(string id)
        {
            return ap => ap.UserId == id;
        }
    }
}
