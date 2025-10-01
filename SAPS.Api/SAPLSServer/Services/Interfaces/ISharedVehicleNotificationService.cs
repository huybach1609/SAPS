using SAPLSServer.Models;

namespace SAPLSServer.Services.Interfaces
{
    /// <summary>
    /// Provides notification services specifically for shared vehicle operations.
    /// </summary>
    public interface ISharedVehicleNotificationService
    {
        /// <summary>
        /// Sends a vehicle sharing invitation notification to the shared person.
        /// </summary>
        /// <param name="sharedPersonId">The ID of the person being invited to share the vehicle.</param>
        /// <param name="vehicle">The vehicle being shared.</param>
        /// <param name="ownerName">The name of the vehicle owner.</param>
        /// <param name="note">Optional note from the owner.</param>
        /// <returns>A task representing the asynchronous notification operation.</returns>
        Task SendVehicleSharingInvitationAsync(string sharedPersonId, Vehicle vehicle, string ownerName, string? note = null);

        /// <summary>
        /// Sends a notification to the vehicle owner when their sharing invitation is accepted.
        /// </summary>
        /// <param name="ownerId">The ID of the vehicle owner.</param>
        /// <param name="sharedVehicle">The shared vehicle that was accepted.</param>
        /// <param name="sharedPersonName">The name of the person who accepted the invitation.</param>
        /// <returns>A task representing the asynchronous notification operation.</returns>
        Task SendVehicleSharingAcceptedAsync(string ownerId, SharedVehicle sharedVehicle, string sharedPersonName);

        /// <summary>
        /// Sends a notification to the vehicle owner when their sharing invitation is rejected.
        /// </summary>
        /// <param name="ownerId">The ID of the vehicle owner.</param>
        /// <param name="sharedVehicle">The shared vehicle that was rejected.</param>
        /// <param name="sharedPersonName">The name of the person who rejected the invitation.</param>
        /// <returns>A task representing the asynchronous notification operation.</returns>
        Task SendVehicleSharingRejectedAsync(string ownerId, SharedVehicle sharedVehicle, string sharedPersonName);

        /// <summary>
        /// Sends a notification to the shared person when the vehicle owner recalls the sharing access.
        /// </summary>
        /// <param name="sharedPersonId">The ID of the person whose access is being recalled.</param>
        /// <param name="sharedVehicle">The shared vehicle being recalled.</param>
        /// <param name="ownerName">The name of the vehicle owner.</param>
        /// <returns>A task representing the asynchronous notification operation.</returns>
        Task SendVehicleSharingRecalledAsync(string sharedPersonId, SharedVehicle sharedVehicle, string ownerName);

        /// <summary>
        /// Sends a notification when a shared vehicle invitation is about to expire.
        /// </summary>
        /// <param name="sharedPersonId">The ID of the person with the expiring invitation.</param>
        /// <param name="sharedVehicle">The shared vehicle with expiring invitation.</param>
        /// <param name="ownerName">The name of the vehicle owner.</param>
        /// <returns>A task representing the asynchronous notification operation.</returns>
        Task SendVehicleSharingExpirationWarningAsync(string sharedPersonId, SharedVehicle sharedVehicle, string ownerName);
    }
}