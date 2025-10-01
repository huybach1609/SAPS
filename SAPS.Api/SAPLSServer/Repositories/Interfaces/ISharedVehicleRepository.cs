using SAPLSServer.Models;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Interfaces
{
    public interface ISharedVehicleRepository : IRepository<SharedVehicle, string>
    {
        /// <summary>
        /// Retrieves a shared vehicle associated with the specified ID, including vehicle data, in a
        /// read-only context.
        /// </summary>
        /// <remarks>This method operates in a read-only context, ensuring that no modifications are made
        /// to the underlying data.</remarks>
        /// <param name="id">The unique identifier of the shared vehicle to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="SharedVehicle"/>
        /// object with associated vehicle data if found; otherwise, <see langword="null"/>.</returns>
        Task<SharedVehicle?> FindIncludingVehicleReadOnly(string id);
        
        /// <summary>
        /// Retrieves a shared vehicle associated with the specified ID, including vehicle and owner data, in a
        /// read-only context.
        /// </summary>
        /// <remarks>This method operates in a read-only context, ensuring that no modifications are made
        /// to the underlying data.</remarks>
        /// <param name="id">The unique identifier of the shared vehicle to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="SharedVehicle"/>
        /// object with associated vehicle and owner data if found; otherwise, <see langword="null"/>.</returns>
        Task<SharedVehicle?> FindIncludingVehicleAndOwnerReadOnly(string id);
        /// <summary>
        /// Retrieves a shared vehicle associated with the specified ID, including vehicle data.
        /// </summary>
        /// <remarks>This method operates in a read-only context, ensuring that no modifications are made
        /// to the underlying data.</remarks>
        /// <param name="id">The unique identifier of the shared vehicle to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="SharedVehicle"/>
        /// object with associated vehicle data if found; otherwise, <see langword="null"/>.</returns>
        Task<SharedVehicle?> FindIncludingVehicle(string id);
        
        /// <summary>
        /// Retrieves a shared vehicle associated with the specified ID, including vehicle and owner data.
        /// </summary>
        /// <remarks>This method operates in a read-only context, ensuring that no modifications are made
        /// to the underlying data.</remarks>
        /// <param name="id">The unique identifier of the shared vehicle to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="SharedVehicle"/>
        /// object with associated vehicle and owner data if found; otherwise, <see langword="null"/>.</returns>
        Task<SharedVehicle?> FindIncludingVehicleAndOwner(string id);
        /// <summary>
        /// Retrieves a shared vehicle associated with the specified ID, including vehicle, owner, and shared person data.
        /// </summary>
        /// <remarks>This method operates in a read-only context, ensuring that no modifications are made to the underlying data.</remarks>
        /// <param name="id">The unique identifier of the shared vehicle to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="SharedVehicle"/>
        /// object with associated vehicle, owner, and shared person data if found; otherwise, <see langword="null"/>.</returns>
        Task<SharedVehicle?> FindIncludingVehicleAndOwnerAndSharedPerson(string id);
        Task<SharedVehicle?> FindIncludingVehicleAndOwnerAndSharedPersonReadOnly(string id);
        Task<SharedVehicle?> FindIncludingVehicleAndOwnerAndSharedPersonReadOnly(Expression<Func<SharedVehicle, bool>>[] criterias);
    }
}
