using SAPLSServer.Models;

namespace SAPLSServer.Repositories.Interfaces
{
    public interface IParkingSessionRepository : IRepository<ParkingSession, string>
    {
        /// <summary>
        /// Retrieves a parking session associated with the specified ID, including vehicle and parking lot data, in a
        /// read-only context.
        /// </summary>
        /// <remarks>This method operates in a read-only context, ensuring that no modifications are made
        /// to the underlying data.</remarks>
        /// <param name="id">The unique identifier of the parking session to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="ParkingSession"/>
        /// object with associated vehicle and parking lot data if found; otherwise, <see langword="null"/>.</returns>
        Task<ParkingSession?> FindIncludingVehicleAndParkingLotReadOnly(string id);
        
        /// <summary>
        /// Retrieves a parking session associated with the specified ID, including vehicle data, in a
        /// read-only context.
        /// </summary>
        /// <remarks>This method operates in a read-only context, ensuring that no modifications are made
        /// to the underlying data.</remarks>
        /// <param name="id">The unique identifier of the parking session to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="ParkingSession"/>
        /// object with associated vehicle data if found; otherwise, <see langword="null"/>.</returns>
        Task<ParkingSession?> FindIncludingVehicleReadOnly(string id);
        
        /// <summary>
        /// Retrieves a parking session associated with the specified ID, including parking lot data, in a
        /// read-only context.
        /// </summary>
        /// <remarks>This method operates in a read-only context, ensuring that no modifications are made
        /// to the underlying data.</remarks>
        /// <param name="id">The unique identifier of the parking session to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="ParkingSession"/>
        /// object with associated parking lot data if found; otherwise, <see langword="null"/>.</returns>
        Task<ParkingSession?> FindIncludingParkingLotReadOnly(string id);
        /// <summary>
        /// Retrieves a parking session associated with the specified ID, including vehicle and parking lot data.
        /// </summary>
        /// <remarks>This method operates in a read-only context, ensuring that no modifications are made
        /// to the underlying data.</remarks>
        /// <param name="id">The unique identifier of the parking session to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="ParkingSession"/>
        /// object with associated vehicle and parking lot data if found; otherwise, <see langword="null"/>.</returns>
        Task<ParkingSession?> FindIncludingVehicleAndParkingLot(string id);
        
        /// <summary>
        /// Retrieves a parking session associated with the specified ID, including vehicle data.
        /// </summary>
        /// <remarks>This method operates in a read-only context, ensuring that no modifications are made
        /// to the underlying data.</remarks>
        /// <param name="id">The unique identifier of the parking session to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="ParkingSession"/>
        /// object with associated vehicle data if found; otherwise, <see langword="null"/>.</returns>
        Task<ParkingSession?> FindIncludingVehicle(string id);
        
        /// <summary>
        /// Retrieves a parking session associated with the specified ID, including parking lot data.
        /// </summary>
        /// <remarks>This method operates in a read-only context, ensuring that no modifications are made
        /// to the underlying data.</remarks>
        /// <param name="id">The unique identifier of the parking session to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="ParkingSession"/>
        /// object with associated parking lot data if found; otherwise, <see langword="null"/>.</returns>
        Task<ParkingSession?> FindIncludingParkingLot(string id);
        /// <summary>
        /// Retrieves a parking session by its unique identifier, including associated vehicle and owner details if
        /// available.
        /// </summary>
        /// <param name="id">The unique identifier of the parking session to retrieve. Cannot be <c>null</c> or empty.</param>
        /// <returns>A <see cref="ParkingSession"/> instance containing the session, vehicle, and owner information if found;
        /// otherwise, <c>null</c>.</returns>
        Task<ParkingSession?> FindIncludingVehicleAndDriver(string id);
        /// <summary>
        /// Retrieves a parking session by its unique identifier, including associated vehicle and owner information, in
        /// read-only context.
        /// </summary>
        /// <remarks>The returned entity and its related data are intended for read-only access.
        /// Modifications to the returned objects will not be tracked or persisted.</remarks>
        /// <param name="id">The unique identifier of the parking session to retrieve. Cannot be <c>null</c> or empty.</param>
        /// <returns>A <see cref="ParkingSession"/> instance containing the session details and related vehicle and owner
        /// information if found; otherwise, <c>null</c>.</returns>
        Task<ParkingSession?> FindIncludingVehicleAndDriverReadOnly(string id);
        /// <summary>
        /// Retrieves a parking session by its unique identifier, including the associated parking fee schedule, in a read-only context.
        /// </summary>
        /// <remarks>
        /// This method operates in a read-only context, ensuring that no modifications are made to the underlying data.
        /// The returned <see cref="ParkingSession"/> will include its related <see cref="ParkingFeeSchedule"/> navigation property if found.
        /// </remarks>
        /// <param name="id">The unique identifier of the parking session to retrieve. Cannot be <c>null</c> or empty.</param>
        /// <returns>
        /// A task that represents the asynchronous operation. The task result contains the <see cref="ParkingSession"/>
        /// object with its associated <see cref="ParkingFeeSchedule"/> if found; otherwise, <see langword="null"/>.
        /// </returns>
        Task<ParkingSession?> FindInlcudingParkingFeeScheduleReadOnly(string id);
        /// <summary>
        /// Retrieves the most recent parking session for a specific vehicle in a specific parking lot.
        /// </summary>
        /// <param name="licensePlate">The licenseplate of the vehicle.</param>
        /// <param name="parkingLotId">The unique identifier of the parking lot.</param>
        /// <returns>
        /// A task that represents the asynchronous operation. The task result contains the latest <see cref="ParkingSession"/>
        /// for the specified vehicle and parking lot if found; otherwise, <see langword="null"/>.
        /// </returns>
        Task<ParkingSession?> FindLatest(string licensePlate, string parkingLotId);
        Task<ParkingSession?> FindLatest(string vehicleId);

        /// <summary>
        /// Counts the total number of parking session transactions in the system.
        /// </summary>
        /// <returns>
        /// A task that represents the asynchronous operation. The task result contains the total number of parking session transactions.
        /// </returns>
        Task<int> CountTransactions();
    }
}
