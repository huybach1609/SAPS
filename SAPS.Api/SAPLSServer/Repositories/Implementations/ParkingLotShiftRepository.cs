using Microsoft.EntityFrameworkCore;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Implementations
{
    public class ParkingLotShiftRepository : Repository<ParkingLotShift, string>, IParkingLotShiftRepository
    {
        public ParkingLotShiftRepository(SaplsContext context) : base(context)
        {
        }

        /// <summary>
        /// Finds a parking lot shift by ID including its associated staff members.
        /// </summary>
        /// <param name="id">The unique identifier of the parking lot shift.</param>
        /// <returns>The parking lot shift with staff information, or null if not found.</returns>
        public async Task<ParkingLotShift?> FindWithStaffAsync(string id)
        {
            return await _dbSet
                .Include(pls => pls.StaffUsers)
                    .ThenInclude(staff => staff.User)
                .FirstOrDefaultAsync(pls => pls.Id == id);
        }

        /// <summary>
        /// Gets all parking lot shifts for a specific parking lot.
        /// </summary>
        /// <param name="parkingLotId">The unique identifier of the parking lot.</param>
        /// <returns>List of parking lot shifts for the specified parking lot.</returns>
        public async Task<List<ParkingLotShift>> GetByParkingLotIdAsync(string parkingLotId)
        {
            return await _dbSet
                .Include(pls => pls.StaffUsers)
                    .ThenInclude(staff => staff.User)
                .Include(pls => pls.ParkingLot)
                .Where(pls => pls.ParkingLotId == parkingLotId)
                .OrderBy(pls => pls.StartTime)
                .ToListAsync();
        }

        /// <summary>
        /// Creates the ID predicate for finding entities by ID.
        /// </summary>
        /// <param name="id">The unique identifier.</param>
        /// <returns>Expression predicate for ID matching.</returns>
        protected override Expression<Func<ParkingLotShift, bool>> CreateIdPredicate(string id)
        {
            return pls => pls.Id == id;
        }
    }
}
