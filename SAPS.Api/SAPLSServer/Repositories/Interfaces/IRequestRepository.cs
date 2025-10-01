using SAPLSServer.Models;

namespace SAPLSServer.Repositories.Interfaces
{
    public interface IRequestRepository : IRepository<Request, string>
    {
        /// <summary>
        /// Retrieves a request associated with the specified ID, including sender data, in a
        /// read-only context.
        /// </summary>
        /// <remarks>This method operates in a read-only context, ensuring that no modifications are made
        /// to the underlying data.</remarks>
        /// <param name="id">The unique identifier of the request to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="Request"/>
        /// object with associated sender data if found; otherwise, <see langword="null"/>.</returns>
        Task<Request?> FindIncludingSenderReadOnly(string id);
        
        /// <summary>
        /// Retrieves a request associated with the specified ID, including sender and last updater data, in a
        /// read-only context.
        /// </summary>
        /// <remarks>This method operates in a read-only context, ensuring that no modifications are made
        /// to the underlying data.</remarks>
        /// <param name="id">The unique identifier of the request to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="Request"/>
        /// object with associated sender and last updater data if found; otherwise, <see langword="null"/>.</returns>
        Task<Request?> FindIncludingSenderAndLastUpdaterReadOnly(string id);
        /// <summary>
        /// Retrieves a request associated with the specified ID, including sender data.
        /// </summary>
        /// <remarks>This method operates in a read-only context, ensuring that no modifications are made
        /// to the underlying data.</remarks>
        /// <param name="id">The unique identifier of the request to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="Request"/>
        /// object with associated sender data if found; otherwise, <see langword="null"/>.</returns>
        Task<Request?> FindIncludingSender(string id);
        
        /// <summary>
        /// Retrieves a request associated with the specified ID, including sender and last updater data.
        /// </summary>
        /// <remarks>This method operates in a read-only context, ensuring that no modifications are made
        /// to the underlying data.</remarks>
        /// <param name="id">The unique identifier of the request to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="Request"/>
        /// object with associated sender and last updater data if found; otherwise, <see langword="null"/>.</returns>
        Task<Request?> FindIncludingSenderAndLastUpdater(string id);
    }
}
