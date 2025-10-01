using Microsoft.EntityFrameworkCore;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Implementations
{
    public class SharedVehicleRepository : Repository<SharedVehicle, string>, ISharedVehicleRepository
    {
        public SharedVehicleRepository(SaplsContext context) : base(context)
        {
        }

        public async Task<SharedVehicle?> FindIncludingVehicleAndOwner(string id)
        {
            return await _dbSet.Include(sv => sv.Vehicle)
                .ThenInclude(v => v.Owner)
                .ThenInclude(o => o.User)
                .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        public async Task<SharedVehicle?> FindIncludingVehicleAndOwnerReadOnly(string id)
        {
            return await _dbSet.Include(sv => sv.Vehicle)
                .ThenInclude(v => v.Owner)
                .ThenInclude(o => o.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        public async Task<SharedVehicle?> FindIncludingVehicle(string id)
        {
            return await _dbSet.Include(sv => sv.Vehicle)
                .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        public async Task<SharedVehicle?> FindIncludingVehicleReadOnly(string id)
        {
            return await _dbSet.Include(sv => sv.Vehicle)
                .AsNoTracking()
                .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        protected override Expression<Func<SharedVehicle, bool>> CreateIdPredicate(string id)
        {
            return sv => sv.Id == id;
        }

        public Task<SharedVehicle?> FindIncludingVehicleAndOwnerAndSharedPerson(string id)
        {
            return _dbSet.Include(sv => sv.Vehicle)
                .ThenInclude(v => v.Owner)
                .ThenInclude(r => r.User)
                .Include(sv => sv.SharedPerson)
                .ThenInclude(sp => sp!.User)
                .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        public Task<SharedVehicle?> FindIncludingVehicleAndOwnerAndSharedPersonReadOnly(string id)
        {
            return _dbSet.Include(sv => sv.Vehicle)
                .ThenInclude(v => v.Owner)
                .ThenInclude(r => r.User)
                .Include(sv => sv.SharedPerson)
                .ThenInclude(sp => sp!.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        public async Task<SharedVehicle?> FindIncludingVehicleAndOwnerAndSharedPersonReadOnly(
            Expression<Func<SharedVehicle, bool>>[] criterias)
        {
            var query = _dbSet.Include(sv => sv.Vehicle)
                            .ThenInclude(v => v.Owner)
                            .ThenInclude(r => r.User)
                            .Include(sv => sv.SharedPerson)
                            .ThenInclude(sp => sp!.User)
                            .AsNoTracking();
            query = ApplyFilters(query, criterias);
            return await query.FirstOrDefaultAsync();
        }
    }
}
