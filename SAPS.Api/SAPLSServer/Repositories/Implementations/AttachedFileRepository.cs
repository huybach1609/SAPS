using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Implementations
{
    public class AttachedFileRepository : Repository<AttachedFile, string>, IAttachedFileRepository
    {
        public AttachedFileRepository(SaplsContext context) : base(context)
        {
        }

        protected override Expression<Func<AttachedFile, bool>> CreateIdPredicate(string id)
        {
            return af => af.Id == id;
        }
    }
}
