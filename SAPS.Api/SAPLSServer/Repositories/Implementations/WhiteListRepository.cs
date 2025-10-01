using Microsoft.EntityFrameworkCore;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Implementations
{
    public class WhiteListRepository : Repository<WhiteList, WhiteListKey>, IWhiteListRepository
    {
        public WhiteListRepository(SaplsContext context) : base(context)
        {
        }

        public async Task<WhiteList?> FindIncludingClientReadOnly(WhiteListKey key)
        {
            return await _dbSet.Include(wl => wl.Client)
                .ThenInclude(c => c.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(CreateIdPredicate(key));
        }
        public async Task<WhiteList?> FindIncludingClient(WhiteListKey key)
        {
            return await _dbSet.Include(wl => wl.Client)
                .ThenInclude(c => c.User)
                .FirstOrDefaultAsync(CreateIdPredicate(key));
        }
        protected override Expression<Func<WhiteList, bool>> CreateIdPredicate(WhiteListKey key)
        {
            return wl => wl.ParkingLotId == key.ParkingLotId && wl.ClientId == key.ClientId;
        }
    }
}
