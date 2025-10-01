using SAPLSServer.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SAPLSServer.Repositories.Interfaces
{
    public interface IParkingLotShiftRepository : IRepository<ParkingLotShift, string>
    {
        Task<List<ParkingLotShift>> GetByParkingLotIdAsync(string parkingLotId);
        Task<ParkingLotShift?> FindWithStaffAsync(string id);
    }
}