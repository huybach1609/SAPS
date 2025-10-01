using SAPLSServer.Models;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Interfaces
{
    public interface IVehicleRepository : IRepository<Vehicle, string>
    {
        Task<Vehicle?> FindIncludeOwner(string vehicleId);
        Task<Vehicle?> FindIncludeOwner(Expression<Func<Vehicle, bool>> criterias);
        Task<Vehicle?> FindIncludeOwnerAndCurrentHolder(string vehicleId);
        Task<Vehicle?> FindIncludeOwnerAndCurrentHolder(Expression<Func<Vehicle, bool>> criterias);

    }
}
