using SAPLSServer.DTOs.Base;
using SAPLSServer.DTOs.Concrete.SharedVehicleDtos;
using SAPLSServer.DTOs.PaginationDto;

namespace SAPLSServer.Services.Interfaces
{
    /// <summary>
    /// Defines operations for creating, retrieving, and managing shared vehicles and their sharing status.
    /// </summary>
    public interface ISharedVehicleService
    {
        /// <summary>
        /// Initiates the sharing of a vehicle by creating a new shared vehicle record.
        /// </summary>
        /// <param name="request">Contains details required to share a vehicle, including vehicle, owner, and shared person information.</param>
        /// <returns>A task representing the asynchronous creation operation.</returns>
        Task Create(CreateSharedVehicleRequest request);

        /// <summary>
        /// Gets detailed information about a specific shared vehicle for the given user.
        /// </summary>
        /// <param name="id">The unique identifier of the shared vehicle.</param>
        /// <param name="currentUserId">The ID of the user requesting the details.</param>
        /// <returns>
        /// A task that returns the shared vehicle details as <see cref="SharedVehicleDetailsDto"/>,
        /// or <c>null</c> if not found or inaccessible to the user.
        /// </returns>
        Task<SharedVehicleDetailsDto?> GetSharedVehicleDetails(string id, string currentUserId);

        /// <summary>
        /// Retrieves a paginated collection of shared vehicles matching the specified filter and pagination criteria.
        /// </summary>
        /// <param name="pageRequest">Pagination parameters such as page number and size.</param>
        /// <param name="request">Filtering criteria for shared vehicles.</param>
        /// <returns>
        /// A task that returns a <see cref="PageResult{SharedVehicleSummaryDto}"/> containing shared vehicle summaries.
        /// </returns>
        Task<PageResult<SharedVehicleSummaryDto>> GetSharedVehiclesPage(PageRequest pageRequest, GetSharedVehicleList request);

        /// <summary>
        /// Retrieves a list of shared vehicles matching the specified filter criteria.
        /// </summary>
        /// <param name="request">Filtering criteria for shared vehicles.</param>
        /// <returns>
        /// A task that returns a <see cref="List{SharedVehicleSummaryDto}"/> of shared vehicle summaries.
        /// </returns>
        Task<List<SharedVehicleSummaryDto>> GetSharedVehiclesList(GetSharedVehicleList request);

        /// <summary>
        /// Accepts a shared vehicle invitation for the specified user, granting them access to the vehicle.
        /// </summary>
        /// <param name="id">The unique identifier of the shared vehicle.</param>
        /// <param name="sharedPersonId">The ID of the user accepting the shared vehicle.</param>
        /// <returns>A task representing the asynchronous accept operation.</returns>
        Task AcceptSharedVehicle(string id, string sharedPersonId);

        /// <summary>
        /// Rejects a shared vehicle invitation for the specified user, declining access to the vehicle.
        /// </summary>
        /// <param name="id">The unique identifier of the shared vehicle.</param>
        /// <param name="sharedPersonId">The ID of the user rejecting the shared vehicle.</param>
        /// <returns>A task representing the asynchronous reject operation.</returns>
        Task RejectSharedVehicle(string id, string sharedPersonId);

        /// <summary>
        /// Recalls a shared vehicle, revoking access for the shared person and ending the sharing relationship.
        /// </summary>
        /// <param name="id">The unique identifier of the shared vehicle.</param>
        /// <param name="ownerId">The ID of the owner recalling the shared vehicle.</param>
        /// <returns>A task representing the asynchronous recall operation.</returns>
        Task RecallSharedVehicle(string id, string ownerId);
        Task<SharedVehicleDetailsDto?> GetByVehicleId(string vehicleId);
    }
}

