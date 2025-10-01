using SAPLSServer.Models;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Interfaces
{
    public interface IParkingLotOwnerProfileRepository : IRepository<ParkingLotOwnerProfile, string>
    {
        /// <summary>
        /// Retrieves a parking lot owner profile associated with the specified user ID, including related user information, in a read-only context.
        /// </summary>
        /// <param name="userId">The unique identifier of the user whose parking lot owner profile is to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="ParkingLotOwnerProfile"/>
        /// object if the user exists and has an associated parking lot owner profile; otherwise, <see langword="null"/>.</returns>
        Task<ParkingLotOwnerProfile?> FindIncludingUserReadOnly(string userId);

        /// <summary>
        /// Retrieves a parking lot owner profile associated with the specified user ID, including related user information.
        /// </summary>
        /// <param name="userId">The unique identifier of the user whose parking lot owner profile is to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="ParkingLotOwnerProfile"/>
        /// object if the user exists and has an associated parking lot owner profile; otherwise, <see langword="null"/>.</returns>
        Task<ParkingLotOwnerProfile?> FindIncludingUser(string userId);

        /// <summary>
        /// Finds a parking lot owner profile including related user data, based on multiple criteria.
        /// </summary>
        /// <param name="criterias">Array of filter expressions to apply.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="ParkingLotOwnerProfile"/>
        /// object if a matching profile is found; otherwise, <see langword="null"/>.</returns>
        Task<ParkingLotOwnerProfile?> FindIncludingUser(Expression<Func<ParkingLotOwnerProfile, bool>>[] criterias);

        /// <summary>
        /// Finds a parking lot owner profile including related user data (read-only), based on multiple criteria.
        /// </summary>
        /// <param name="criterias">Array of filter expressions to apply.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="ParkingLotOwnerProfile"/>
        /// object if a matching profile is found; otherwise, <see langword="null"/>.</returns>
        Task<ParkingLotOwnerProfile?> FindIncludingUserReadOnly(Expression<Func<ParkingLotOwnerProfile, bool>>[] criterias);
    }
}
