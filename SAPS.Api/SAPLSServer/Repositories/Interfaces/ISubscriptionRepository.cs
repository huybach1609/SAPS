using SAPLSServer.Models;

namespace SAPLSServer.Repositories.Interfaces
{
    public interface ISubscriptionRepository : IRepository<Subscription, string>
    {
        Task<Subscription?> FindIncludUpdatedByReadOnly(string id);
        Task<Subscription?> FindIncludUpdatedBy(string id);
    }
}