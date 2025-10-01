using Microsoft.EntityFrameworkCore;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Implementations
{
    public class StaffProfileRepository : Repository<StaffProfile, string>, IStaffProfileRepository
    {
        public StaffProfileRepository(SaplsContext context) : base(context) { }

        public async Task<StaffProfile?> FindIncludingUser(string userId)
        {
            return await _dbSet.Include(sp => sp.User).FirstOrDefaultAsync(sp => sp.UserId == userId);
        }

        public async Task<StaffProfile?> FindIncludingUserReadOnly(string userId)
        {
            return await _dbSet.Include(sp => sp.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(sp => sp.UserId == userId);
        }

        public async Task<StaffProfile?> FindIncludingUser(Expression<Func<StaffProfile, bool>>[] criterias)
        {
            var query = _dbSet.Include(sp => sp.User).AsQueryable();
            query = ApplyFilters(query, criterias);
            return await query.FirstOrDefaultAsync();
        }

        public async Task<StaffProfile?> FindIncludingUserReadOnly(Expression<Func<StaffProfile, bool>>[] criterias)
        {
            var query = _dbSet.Include(sp => sp.User).AsNoTracking();
            query = ApplyFilters(query, criterias);
            return await query.FirstOrDefaultAsync();
        }

        protected override Expression<Func<StaffProfile, bool>> CreateIdPredicate(string id)
        {
            return sp => sp.UserId == id;
        }

        public async Task<StaffProfile?> FindIncludingShiftReadOnly(string userId)
        {
            return await _dbSet.Include(sp => sp.ParkingLotShifts).AsNoTracking()
                .FirstOrDefaultAsync(sp => sp.UserId == userId);
        }
    }
}
