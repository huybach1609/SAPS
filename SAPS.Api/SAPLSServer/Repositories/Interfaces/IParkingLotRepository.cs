using SAPLSServer.Models;

namespace SAPLSServer.Repositories.Interfaces
{
    public interface IParkingLotRepository : IRepository<ParkingLot, string>
    {
        /// <summary>
        /// Retrieves a parking lot by its unique identifier, including its associated owner information, in a read-only
        /// context.
        /// </summary>
        /// <param name="id">The unique identifier of the parking lot to retrieve. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the parking lot with its owner
        /// information  if found; otherwise, <see langword="null"/>.</returns>
        Task<ParkingLot?> FindIncludingParkingLotOwnerReadOnly(string id);
    }
}
