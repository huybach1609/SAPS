using Microsoft.EntityFrameworkCore;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Implementations
{
    public class ParkingLotOwnerProfileRepository : Repository<ParkingLotOwnerProfile, string>, IParkingLotOwnerProfileRepository
    {
        public ParkingLotOwnerProfileRepository(SaplsContext context) : base(context) { }

        public async Task<ParkingLotOwnerProfile?> FindIncludingUser(string userId)
        {
            return await _dbSet.Include(po => po.User).FirstOrDefaultAsync(po => po.UserId == userId);
        }

        public async Task<ParkingLotOwnerProfile?> FindIncludingUserReadOnly(string userId)
        {
            return await _dbSet.Include(po => po.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(po => po.UserId == userId);
        }

        public async Task<ParkingLotOwnerProfile?> FindIncludingUser(Expression<Func<ParkingLotOwnerProfile, bool>>[] criterias)
        {
            var query = _dbSet.Include(po => po.User).AsQueryable();
            query = ApplyFilters(query, criterias);
            return await query.FirstOrDefaultAsync();
        }

        public async Task<ParkingLotOwnerProfile?> FindIncludingUserReadOnly(Expression<Func<ParkingLotOwnerProfile, bool>>[] criterias)
        {
            var query = _dbSet.Include(po => po.User).AsNoTracking();
            query = ApplyFilters(query, criterias);
            return await query.FirstOrDefaultAsync();
        }

        protected override Expression<Func<ParkingLotOwnerProfile, bool>> CreateIdPredicate(string id)
        {
            return po => po.UserId == id;
        }
    }
}
