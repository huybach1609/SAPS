using SAPLSServer.Models;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Interfaces
{
    public interface IClientProfileRepository : IRepository<ClientProfile, string>
    {
        /// <summary>
        /// Retrieves a client profile associated with the specified user ID, including related user information, in a read-only context.
        /// </summary>
        /// <param name="userId">The unique identifier of the user whose client profile is to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="ClientProfile"/>
        /// object if the user exists and has an associated client profile; otherwise, <see langword="null"/>.</returns>
        Task<ClientProfile?> FindIncludingUserReadOnly(string userId);

        /// <summary>
        /// Retrieves a client profile associated with the specified user ID, including related user information.
        /// </summary>
        /// <param name="userId">The unique identifier of the user whose client profile is to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="ClientProfile"/>
        /// object if the user exists and has an associated client profile; otherwise, <see langword="null"/>.</returns>
        Task<ClientProfile?> FindIncludingUser(string userId);

        /// <summary>
        /// Finds a client profile including related user data, based on multiple criteria.
        /// </summary>
        /// <param name="criterias">Array of filter expressions to apply.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="ClientProfile"/>
        /// object if a matching profile is found; otherwise, <see langword="null"/>.</returns>
        Task<ClientProfile?> FindIncludingUser(Expression<Func<ClientProfile, bool>>[] criterias);

        /// <summary>
        /// Finds a client profile including related user data (read-only), based on multiple criteria.
        /// </summary>
        /// <param name="criterias">Array of filter expressions to apply.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="ClientProfile"/>
        /// object if a matching profile is found; otherwise, <see langword="null"/>.</returns>
        Task<ClientProfile?> FindIncludingUserReadOnly(Expression<Func<ClientProfile, bool>>[] criterias);
    }
}
