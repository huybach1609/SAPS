using Microsoft.EntityFrameworkCore;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Implementations
{
    public class IncidenceEvidenceRepository : Repository<IncidenceEvidence, string>, IIncidenceEvidenceRepository
    {
        public IncidenceEvidenceRepository(SaplsContext context) : base(context)
        {
        }

        public Task<IncidenceEvidence?> FindIncludeAttachedFileReadonly(string attachedFileId)
        {
            return _dbSet.Include(ie => ie.AttachedFile)
                          .AsNoTracking()
                          .FirstOrDefaultAsync(ie => ie.AttachedFileId == attachedFileId);
        }

        protected override Expression<Func<IncidenceEvidence, bool>> CreateIdPredicate(string id)
        {
            return ie => ie.AttachedFileId == id;
        }
    }
}
