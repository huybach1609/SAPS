using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Implementations
{
    public class ParkingFeeScheduleRepository : Repository<ParkingFeeSchedule, string>, IParkingFeeScheduleRepository
    {
        public ParkingFeeScheduleRepository(SaplsContext context) : base(context)
        {
        }
        protected override Expression<Func<ParkingFeeSchedule, bool>> CreateIdPredicate(string id)
        {
            return pfs => pfs.Id == id;
        }
    }
}
