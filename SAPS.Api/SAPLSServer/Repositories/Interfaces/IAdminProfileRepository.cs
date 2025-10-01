using SAPLSServer.Models;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Interfaces
{
    public interface IAdminProfileRepository : IRepository<AdminProfile, string>
    {
        /// <summary>
        /// Retrieves an admin profile associated with the specified user ID, including related user information, in a read-only context.
        /// </summary>
        /// <param name="userId">The unique identifier of the user whose admin profile is to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="AdminProfile"/>
        /// object if the user exists and has an associated admin profile; otherwise, <see langword="null"/>.</returns>
        Task<AdminProfile?> FindIncludingUserReadOnly(string userId);

        /// <summary>
        /// Retrieves an admin profile associated with the specified user ID, including related user information.
        /// </summary>
        /// <param name="userId">The unique identifier of the user whose admin profile is to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="AdminProfile"/>
        /// object if the user exists and has an associated admin profile; otherwise, <see langword="null"/>.</returns>
        Task<AdminProfile?> FindIncludingUser(string userId);

        /// <summary>
        /// Finds an admin profile including related user information, based on multiple criteria.
        /// </summary>
        /// <param name="criterias">Array of filter expressions to apply.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="AdminProfile"/>
        /// object if a matching profile is found; otherwise, <see langword="null"/>.</returns>
        Task<AdminProfile?> FindIncludingUser(Expression<Func<AdminProfile, bool>>[] criterias);

        /// <summary>
        /// Finds an admin profile including related user information (read-only), based on multiple criteria.
        /// </summary>
        /// <param name="criterias">Array of filter expressions to apply.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="AdminProfile"/>
        /// object if a matching profile is found; otherwise, <see langword="null"/>.</returns>
        Task<AdminProfile?> FindIncludingUserReadOnly(Expression<Func<AdminProfile, bool>>[] criterias);
    }
}
