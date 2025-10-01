using Microsoft.EntityFrameworkCore;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Implementations
{
    public class RequestAttachedFileRepository : Repository<RequestAttachedFile, string>, IRequestAttachedFileRepository
    {
        public RequestAttachedFileRepository(SaplsContext context) : base(context)
        {
        }

        public Task<RequestAttachedFile?> FindIncludeAttachedFileReadonly(string attachedFileId)
        {
            return _dbSet.Include(raf => raf.AttachedFile)
                         .AsNoTracking()
                         .FirstOrDefaultAsync(raf => raf.AttachedFileId == attachedFileId);
        }

        protected override Expression<Func<RequestAttachedFile, bool>> CreateIdPredicate(string id)
        {
            return raf => raf.AttachedFileId == id;
        }
    }
}
