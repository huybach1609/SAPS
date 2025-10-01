using Microsoft.EntityFrameworkCore;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Implementations
{
    public class ParkingLotRepository : Repository<ParkingLot, string>, IParkingLotRepository
    {
        public ParkingLotRepository(SaplsContext context) : base(context)
        {
        }

        public Task<ParkingLot?> FindIncludingParkingLotOwnerReadOnly(string id)
        {
            return _dbSet.Include(pl => pl.ParkingLotOwner)
                .ThenInclude(p => p.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        protected override Expression<Func<ParkingLot, bool>> CreateIdPredicate(string id)
        {
            return pl => pl.Id == id;
        }
    }
}