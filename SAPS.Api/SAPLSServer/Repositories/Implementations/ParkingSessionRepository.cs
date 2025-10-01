using Microsoft.EntityFrameworkCore;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Implementations
{
    public class ParkingSessionRepository : Repository<ParkingSession, string>, IParkingSessionRepository
    {
        public ParkingSessionRepository(SaplsContext context) : base(context)
        {
        }

        public async Task<ParkingSession?> FindIncludingParkingLot(string id)
        {
            return await _dbSet.Include(ps => ps.ParkingLot)
                .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        public async Task<ParkingSession?> FindIncludingParkingLotReadOnly(string id)
        {
            return await _dbSet.Include(ps => ps.ParkingLot)
                .AsNoTracking()
                .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        public async Task<ParkingSession?> FindIncludingVehicleAndParkingLot(string id)
        {
            return await _dbSet.Include(ps => ps.Vehicle)
                .Include(ps => ps.ParkingLot)
                .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        public async Task<ParkingSession?> FindIncludingVehicleAndParkingLotReadOnly(string id)
        {
            return await _dbSet.Include(ps => ps.Vehicle)
                .Include(ps => ps.ParkingLot)
                .AsNoTracking()
                .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        public async Task<ParkingSession?> FindIncludingVehicle(string id)
        {
            return await _dbSet.Include(ps => ps.Vehicle)
                .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        public async Task<ParkingSession?> FindIncludingVehicleReadOnly(string id)
        {
            return await _dbSet.Include(ps => ps.Vehicle)
                .AsNoTracking()
                .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        protected override Expression<Func<ParkingSession, bool>> CreateIdPredicate(string id)
        {
            return ps => ps.Id == id;
        }

        public async Task<ParkingSession?> FindIncludingVehicleAndDriver(string id)
        {
           return await _dbSet.Include(ps => ps.Vehicle)
                .Include(ps => ps!.Driver)
                .ThenInclude(đ => đ!.User)
                .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        public async Task<ParkingSession?> FindIncludingVehicleAndDriverReadOnly(string id)
        {
            return await _dbSet.Include(ps => ps.Vehicle)
                .Include(ps => ps.Driver)
                .ThenInclude(đ => đ!.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        public async Task<ParkingSession?> FindInlcudingParkingFeeScheduleReadOnly(string id)
        {
            return await _dbSet.Include(ps => ps.ParkingFeeSchedule)
                .AsNoTracking()
                .FirstOrDefaultAsync(CreateIdPredicate(id));
        }

        public async Task<ParkingSession?> FindLatest(string licensePlate, string parkingLotId)
        {
            return await _dbSet.Where(ps => ps.LicensePlate == licensePlate && ps.ParkingLotId == parkingLotId)
                .OrderByDescending(ps => ps.EntryDateTime)
                .FirstOrDefaultAsync();
        }

        public async Task<ParkingSession?> FindLatest(string vehicleId)
        {
            return await _dbSet.Where(ps => ps.VehicleId == vehicleId)
                .OrderByDescending(ps => ps.EntryDateTime)
                .FirstOrDefaultAsync();
        }

        public async Task<int> CountTransactions()
        {
            // Sum the TransactionCount property for all sessions, treating null as 0
            return await _dbSet.SumAsync(ps => ps.TransactionCount ?? 0);
        }
    }
}
