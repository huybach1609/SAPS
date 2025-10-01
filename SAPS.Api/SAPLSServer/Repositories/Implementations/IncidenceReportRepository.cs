using Microsoft.EntityFrameworkCore;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Implementations
{
    public class IncidenceReportRepository : Repository<IncidenceReport, string>, IIncidenceReportRepository
    {
        public IncidenceReportRepository(SaplsContext context) : base(context)
        {
        }

        public async Task<IncidenceReport?> FindIncludeSenderInformation(string id)
        {
            return await _dbSet.Include(ir => ir.Reporter)
                .ThenInclude(r => r!.User)
                .FirstOrDefaultAsync(ir => ir.Id == id);
        }

        public async Task<IncidenceReport?> FindIncludeSenderInformationReadOnly(string id)
        {
            return await _dbSet.Include(ir => ir.Reporter)
                .ThenInclude(r => r!.User)
                .AsNoTracking().FirstOrDefaultAsync(ir => ir.Id == id);
        }

        protected override Expression<Func<IncidenceReport, bool>> CreateIdPredicate(string id)
        {
            return ir => ir.Id == id;
        }
    }
}
