using Microsoft.EntityFrameworkCore;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Implementations
{
    public class ShiftDiaryRepository : Repository<ShiftDiary, string>, IShiftDiaryRepository
    {
        public ShiftDiaryRepository(SaplsContext context) : base(context)
        {
        }

        public async Task<ShiftDiary?> FindIncludingSender(string id)
        {
            return await _dbSet.Include(id => id.Sender)
                .ThenInclude(s => s!.User)
                .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        public async Task<ShiftDiary?> FindIncludingSenderReadOnly(string id)
        {
            return await _dbSet.Include(id => id.Sender)
                .ThenInclude(s => s!.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        protected override Expression<Func<ShiftDiary, bool>> CreateIdPredicate(string id)
        {
            return sd => sd.Id == id;
        }
    }
}
