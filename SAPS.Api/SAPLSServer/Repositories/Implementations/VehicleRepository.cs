using Microsoft.EntityFrameworkCore;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Implementations
{
    public class VehicleRepository : Repository<Vehicle, string>, IVehicleRepository
    {
        public VehicleRepository(SaplsContext context) : base(context)
        {
        }

        public Task<Vehicle?> FindIncludeOwner(string vehicleId)
        {
            return _dbSet.Include(v => v.Owner).ThenInclude(o => o.User)
                         .AsNoTracking().FirstOrDefaultAsync(v => v.Id == vehicleId);
        }

        public Task<Vehicle?> FindIncludeOwner(Expression<Func<Vehicle, bool>> criterias)
        {
            return _dbSet.Include(v => v.Owner)
                            .ThenInclude(o => o.User)
                         .AsNoTracking().FirstOrDefaultAsync(criterias);
        }

        public Task<Vehicle?> FindIncludeOwnerAndCurrentHolder(string vehicleId)
        {
            return _dbSet.Include(v => v.Owner)
                            .ThenInclude(o => o.User)
                         .Include(v => v.CurrentHolder)
                            .ThenInclude(c => c!.User)
                         .AsNoTracking().FirstOrDefaultAsync(v => v.Id == vehicleId);
        }

        public Task<Vehicle?> FindIncludeOwnerAndCurrentHolder(Expression<Func<Vehicle, bool>> criterias)
        {
           return _dbSet.Include(v => v.Owner)
                            .ThenInclude(o => o.User)
                         .Include(v => v.CurrentHolder)
                            .ThenInclude(c => c!.User)
                         .AsNoTracking().FirstOrDefaultAsync(criterias);
        }

        protected override Expression<Func<Vehicle, bool>> CreateIdPredicate(string id)
        {
            return v => v.Id == id;
        }
    }
}
