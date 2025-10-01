using SAPLSServer.DTOs.Base;
using SAPLSServer.DTOs.Concrete.VehicleDtos;
using SAPLSServer.DTOs.PaginationDto;

namespace SAPLSServer.Services.Interfaces
{
    /// <summary>
    /// Provides operations for managing vehicles, including creation, updates, retrieval, and deletion.
    /// </summary>
    public interface IVehicleService
    {
        /// <summary>
        /// Creates a new vehicle in the system using the provided details.
        /// </summary>
        /// <param name="request">The request containing vehicle details and registration certificates.</param>
        /// <param name="currentUserId"> The ID of the user making the request (must be a client).</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task Create(CreateVehicleRequest request, string currentUserId);

        /// <summary>
        /// Updates an existing vehicle's details.
        /// </summary>
        /// <param name="request">The request containing updated vehicle details.</param>
        /// <param name="currentUserId">The ID of the user making the request.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task Update(UpdateVehicleRequest request, string currentUserId);

        /// <summary>
        /// Updates the status of a vehicle (e.g., active, inactive).
        /// </summary>
        /// <param name="request">The request containing the vehicle ID and new status.</param>
        /// <param name="currentUserId">The ID of the user making the request.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task UpdateStatus(UpdateVehicleStatusRequest request, string currentUserId);

        /// <summary>
        /// Sets the current driver for a vehicle.
        /// </summary>
        /// <param name="id">The unique identifier of the vehicle.</param>
        /// <param name="currentUserId">The ID of the user to set as the current driver.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task UpdateCurrentDriver(string id, string currentUserId);

        /// <summary>
        /// Updates the sharing status of a vehicle (only vehicle owner can change).
        /// </summary>
        /// <param name="request">The request containing the vehicle ID and new sharing status.</param>
        /// <param name="currentUserId">The ID of the user making the request (must be vehicle owner).</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task UpdateVehicleSharingStatus(UpdateVehicleSharingStatusRequest request, string currentUserId);

        /// <summary>
        /// Deletes a vehicle from the system by its unique identifier.
        /// </summary>
        /// <param name="request">The request containing the vehicle ID to delete.</param>
        /// <param name="currentUserId">The ID of the user making the request.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task DeleteVehicle(DeleteRequest request, string currentUserId);

        /// <summary>
        /// Retrieves detailed information about a vehicle by its unique identifier.
        /// </summary>
        /// <param name="id">The unique identifier of the vehicle.</param>
        /// <returns>A task that returns the vehicle's detailed information, or null if not found.</returns>
        Task<VehicleDetailsDto?> GetById(string id);

        /// <summary>
        /// Retrieves detailed information about a vehicle by its license plate.
        /// </summary>
        /// <param name="licensePlate">The license plate of the vehicle.</param>
        /// <returns>A task that returns the vehicle's detailed information, or null if not found.</returns>
        Task<VehicleDetailsDto?> GetByLicensePlate(string licensePlate);

        /// <summary>
        /// Retrieves a paginated list of vehicles for a specific owner with optional filters.
        /// </summary>
        /// <param name="pageRequest">The pagination request containing page number and size.</param>
        /// <param name="request">The search and filter criteria for vehicles (OwnerId is required).</param>
        /// <returns>A task that returns a paginated result of vehicle summaries.</returns>
        Task<PageResult<VehicleSummaryDto>> GetVehiclesPage(PageRequest pageRequest, GetVehicleListRequest request);

        /// <summary>
        /// Retrieves a list of vehicles for a specific owner with optional filters.
        /// </summary>
        /// <param name="request">The search and filter criteria for vehicles (OwnerId is required).</param>
        /// <returns>A task that returns a list of vehicle summaries.</returns>
        Task<List<VehicleSummaryDto>> GetAllVehicles(GetVehicleListRequest request);
        /// <summary>
        /// Gets the current holder (driver or owner) of the specified vehicle.
        /// </summary>
        /// <param name="vehicleId">The unique identifier of the vehicle.</param>
        /// <returns>
        /// A task that returns the user ID of the current holder of the vehicle, or <c>null</c> if not found.
        /// </returns>
        Task<string?> GetCurrentHolderId(string vehicleId);
    }
}

