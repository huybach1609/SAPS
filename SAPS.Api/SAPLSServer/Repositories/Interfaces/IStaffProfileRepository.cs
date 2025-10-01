using SAPLSServer.Models;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Interfaces
{
    public interface IStaffProfileRepository : IRepository<StaffProfile, string>
    {
        /// <summary>
        /// Retrieves a staff profile associated with the specified user ID, including related user information, in a read-only context.
        /// </summary>
        /// <param name="userId">The unique identifier of the user whose staff profile is to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="StaffProfile"/>
        /// object if the user exists and has an associated staff profile; otherwise, <see langword="null"/>.</returns>
        Task<StaffProfile?> FindIncludingUserReadOnly(string userId);

        /// <summary>
        /// Retrieves a staff profile associated with the specified user ID, including related user information.
        /// </summary>
        /// <param name="userId">The unique identifier of the user whose staff profile is to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="StaffProfile"/>
        /// object if the user exists and has an associated staff profile; otherwise, <see langword="null"/>.</returns>
        Task<StaffProfile?> FindIncludingUser(string userId);

        /// <summary>
        /// Finds a staff profile including related user data, based on multiple criteria.
        /// </summary>
        /// <param name="criterias">Array of filter expressions to apply.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="StaffProfile"/>
        /// object if a matching profile is found; otherwise, <see langword="null"/>.</returns>
        Task<StaffProfile?> FindIncludingUser(Expression<Func<StaffProfile, bool>>[] criterias);

        /// <summary>
        /// Finds a staff profile including related user data (read-only), based on multiple criteria.
        /// </summary>
        /// <param name="criterias">Array of filter expressions to apply.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="StaffProfile"/>
        /// object if a matching profile is found; otherwise, <see langword="null"/>.</returns>
        Task<StaffProfile?> FindIncludingUserReadOnly(Expression<Func<StaffProfile, bool>>[] criterias);
        Task<StaffProfile?> FindIncludingShiftReadOnly(string userId);
    }
}