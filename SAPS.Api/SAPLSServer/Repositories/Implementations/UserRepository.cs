using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Implementations
{
    public class UserRepository : Repository<User, string>, IUserRepository
    {
        public UserRepository(SaplsContext context) : base(context)
        {
        }
        protected override Expression<Func<User, bool>> CreateIdPredicate(string id)
        {
            return u => u.Id == id;
        }
    }
}
