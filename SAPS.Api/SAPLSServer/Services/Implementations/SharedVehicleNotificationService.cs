using SAPLSServer.DTOs.Concrete.NotificationDtos;
using SAPLSServer.Models;
using SAPLSServer.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace SAPLSServer.Services.Implementations
{
    /// <summary>
    /// Provides notification services for shared vehicle operations using Firebase Cloud Messaging.
    /// </summary>
    public class SharedVehicleNotificationService : ISharedVehicleNotificationService
    {
        //private readonly IFirebaseNotificationService _firebaseNotificationService;
        private readonly IClientService _clientService;

        public SharedVehicleNotificationService(
            //IFirebaseNotificationService firebaseNotificationService
            IClientService clientService)
        {
            //_firebaseNotificationService = firebaseNotificationService;
            _clientService = clientService;
        }

        public async Task SendVehicleSharingInvitationAsync(string sharedPersonId, Vehicle vehicle, string ownerName, string? note = null)
        {
            var notification = new NotificationRequest
            {
                Title = "Vehicle Sharing Invitation",
                Body = $"{ownerName} has invited you to use their vehicle {vehicle.LicensePlate}.{(!string.IsNullOrWhiteSpace(note) ? $" Note: {note}" : "")}",
                Data = new Dictionary<string, string>
                {
                    { "type", "vehicle_sharing_invitation" },
                    { "vehicle_id", vehicle.Id },
                    { "license_plate", vehicle.LicensePlate },
                    { "owner_name", ownerName },
                    { "action_required", "true" }
                }
            };

            await SendNotificationToUser(sharedPersonId, notification, "vehicle sharing invitation");
        }

        public async Task SendVehicleSharingAcceptedAsync(string ownerId, SharedVehicle sharedVehicle, string sharedPersonName)
        {
            var notification = new NotificationRequest
            {
                Title = "Vehicle Sharing Accepted",
                Body = $"{sharedPersonName} has accepted your vehicle sharing invitation for {sharedVehicle.Vehicle.LicensePlate}",
                Data = new Dictionary<string, string>
                {
                    { "type", "vehicle_sharing_accepted" },
                    { "vehicle_id", sharedVehicle.VehicleId },
                    { "license_plate", sharedVehicle.Vehicle.LicensePlate },
                    { "shared_person_name", sharedPersonName },
                    { "shared_vehicle_id", sharedVehicle.Id }
                }
            };

            await SendNotificationToUser(ownerId, notification, "vehicle sharing acceptance");
        }

        public async Task SendVehicleSharingRejectedAsync(string ownerId, SharedVehicle sharedVehicle, string sharedPersonName)
        {
            var notification = new NotificationRequest
            {
                Title = "Vehicle Sharing Rejected",
                Body = $"{sharedPersonName} has rejected your vehicle sharing invitation for {sharedVehicle.Vehicle.LicensePlate}",
                Data = new Dictionary<string, string>
                {
                    { "type", "vehicle_sharing_rejected" },
                    { "vehicle_id", sharedVehicle.VehicleId },
                    { "license_plate", sharedVehicle.Vehicle.LicensePlate },
                    { "shared_person_name", sharedPersonName },
                    { "shared_vehicle_id", sharedVehicle.Id }
                }
            };

            await SendNotificationToUser(ownerId, notification, "vehicle sharing rejection");
        }

        public async Task SendVehicleSharingRecalledAsync(string sharedPersonId, SharedVehicle sharedVehicle, string ownerName)
        {
            var notification = new NotificationRequest
            {
                Title = "Vehicle Sharing Recalled",
                Body = $"{ownerName} has recalled the sharing access for vehicle {sharedVehicle.Vehicle.LicensePlate}",
                Data = new Dictionary<string, string>
                {
                    { "type", "vehicle_sharing_recalled" },
                    { "vehicle_id", sharedVehicle.VehicleId },
                    { "license_plate", sharedVehicle.Vehicle.LicensePlate },
                    { "owner_name", ownerName },
                    { "shared_vehicle_id", sharedVehicle.Id }
                }
            };

            await SendNotificationToUser(sharedPersonId, notification, "vehicle sharing recall");
        }

        public async Task SendVehicleSharingExpirationWarningAsync(string sharedPersonId, SharedVehicle sharedVehicle, string ownerName)
        {
            var notification = new NotificationRequest
            {
                Title = "Vehicle Sharing Invitation Expiring",
                Body = $"Your invitation to use {ownerName}'s vehicle {sharedVehicle.Vehicle.LicensePlate} will expire soon. Please respond.",
                Data = new Dictionary<string, string>
                {
                    { "type", "vehicle_sharing_expiration_warning" },
                    { "vehicle_id", sharedVehicle.VehicleId },
                    { "license_plate", sharedVehicle.Vehicle.LicensePlate },
                    { "owner_name", ownerName },
                    { "shared_vehicle_id", sharedVehicle.Id },
                    { "expires_at", sharedVehicle.ExpireAt?.ToString("yyyy-MM-ddTHH:mm:ssZ") ?? "" }
                }
            };

            await SendNotificationToUser(sharedPersonId, notification, "vehicle sharing expiration warning");
        }

        #region Private Methods

        private async Task SendNotificationToUser(string userId, NotificationRequest notification, string notificationType)
        {
            try
            {
                // Get user's device token from ClientProfile
                var deviceToken = await _clientService.GetDeviceToken(userId);
                
                if (string.IsNullOrWhiteSpace(deviceToken))
                {
                    return;
                }

                // Send notification directly to device token
                //var result = ;
                //var result = await _firebaseNotificationService.SendNotificationToTokenAsync(deviceToken, notification);
                
                //if (!result.IsSuccess)
                //{
                //    // If token is invalid, clear it from the client profile
                //    if (result.FailedTokens?.Contains(deviceToken) == true)
                //    {
                //        await _clientService.UpdateDeviceToken(userId, null);
                //    }
                //}
            }
            catch (Exception)
            {
            }
        }

        #endregion
    }
}