namespace SAPLSServer.Constants
{
    /// <summary>
    /// Static class containing all API endpoint paths used throughout the application.
    /// Organized by controller for easy maintenance and reference.
    /// </summary>
    public static class APIPaths
    {
        #region Admin Controller
        public static class Admin
        {
            public const string Base = "api/admin";
            public const string Register = "api/admin/register";
            public const string Update = "api/admin";
            public const string GetByAdminId = "api/admin/{adminId}";
            public const string GetByUserId = "api/admin/user/{userId}";
            public const string GetPage = "api/admin/page";
            public const string GetList = "api/admin";
        }
        #endregion

        #region Auth Controller
        public static class Auth
        {
            public const string Base = "api/auth";
            public const string Login = "api/auth/login";
            public const string ClientLogin = "api/auth/client/login";
            public const string GoogleLogin = "api/auth/google-login";
            public const string GoogleCallback = "api/auth/google-callback";
            public const string GoogleAuth = "api/auth/google";
            public const string Logout = "api/auth/logout";
            public const string GoogleLogout = "api/auth/google-logout";
            public const string RefreshToken = "api/auth/refresh-token";
        }
        #endregion

        #region Citizen Card OCR Controller
        public static class CitizenCardOcr
        {
            public const string Base = "api/ocr/citizen-card";
            public const string ExtractFromBase64 = "api/ocr/citizen-card/base64";
            public const string ExtractFromFile = "api/ocr/citizen-card/file";
        }
        #endregion

        #region Client Controller
        public static class Client
        {
            public const string Base = "api/client";
            public const string Register = "api/client/register";
            public const string Update = "api/client";
            public const string GetByUserId = "api/client/user/{userId}";
            public const string GetPage = "api/client/page";
            public const string RegisterDeviceToken = "api/client/register-device-token";
            public const string UnregisterDeviceToken = "api/client/unregister-device-token";
        }
        #endregion

        #region Email Confirmation Controller
        public static class EmailConfirmation
        {
            public const string Base = "api/emailconfirmation";
            public const string ConfirmEmail = "api/emailconfirmation/confirm-email";
        }
        #endregion

        #region File Controller
        public static class File
        {
            public const string Base = "api/file";
            public const string Upload = "api/file/upload";
            public const string UploadMultiple = "api/file/upload/multiple";
            public const string Download = "api/file/download/{fileName}";
        }
        #endregion

        #region Incident Report Controller
        public static class IncidentReport
        {
            public const string Base = "api/incidentreport";
            public const string Create = "api/incidentreport";
            public const string UpdateStatus = "api/incidentreport/status";
            public const string GetDetails = "api/incidentreport/{id}";
            public const string GetPage = "api/incidentreport/page";
        }
        #endregion

        #region Notification Controller
        public static class Notification
        {
            public const string Base = "api/notification";
            public const string SendToToken = "api/notification/send-to-token";
            public const string SendBulk = "api/notification/send-bulk";
            public const string SendToTopic = "api/notification/send-to-topic/{topic}";
        }
        #endregion

        #region Parking Fee Schedule Controller
        public static class ParkingFeeSchedule
        {
            public const string Base = "api/parkingfeeschedule";
            public const string Create = "api/parkingfeeschedule";
            public const string Update = "api/parkingfeeschedule";
            public const string GetByParkingLot = "api/parkingfeeschedule/by-parking-lot/{parkingLotId}";
            public const string GetById = "api/parkingfeeschedule/{id}";
        }
        #endregion

        #region Parking Lot Controller
        public static class ParkingLot
        {
            public const string Base = "api/parkinglot";
            public const string Create = "api/parkinglot";
            public const string UpdateBasicInfo = "api/parkinglot/basic-info";
            public const string UpdateAddress = "api/parkinglot/address";
            public const string UpdateSubscription = "api/parkinglot/subscription";
        }
        #endregion

        #region Parking Lot Owner Controller
        public static class ParkingLotOwner
        {
            public const string Base = "api/parkinglotowner";
            public const string Register = "api/parkinglotowner/register";
            public const string Update = "api/parkinglotowner";
            public const string GetByOwnerId = "api/parkinglotowner/{ownerId}";
            public const string GetByUserId = "api/parkinglotowner/user/{userId}";
            public const string GetPage = "api/parkinglotowner/page";
            public const string GetList = "api/parkinglotowner";
        }
        #endregion

        #region Parking Lot Shift Controller
        public static class ParkingLotShift
        {
            public const string Base = "api/parkinglotshift";
            public const string GetByParkingLot = "api/parkinglotshift/by-parking-lot/{parkingLotId}";
            public const string GetById = "api/parkinglotshift/{id}";
            public const string Create = "api/parkinglotshift";
            public const string Update = "api/parkinglotshift";
            public const string Delete = "api/parkinglotshift/{id}";
        }
        #endregion

        #region Parking Session Controller
        public static class ParkingSession
        {
            public const string Base = "api/parkingsession";
            public const string GetClientDetails = "api/parkingsession/client/{sessionId}";
            public const string GetLotDetails = "api/parkingsession/lot/{sessionId}";
            public const string GetByClient = "api/parkingsession/by-client";
            public const string GetByLot = "api/parkingsession/by-lot";
            public const string GetOwned = "api/parkingsession/owned/{clientId}";
            public const string GetPageByClient = "api/parkingsession/page/by-client";
            public const string GetPageByLot = "api/parkingsession/page/by-lot";
            public const string GetPageByOwned = "api/parkingsession/page/owned/{clientId}";
            public const string CheckIn = "api/parkingsession/check-in";
            public const string CheckOut = "api/parkingsession/check-out";
            public const string Finish = "api/parkingsession/finish";
            public const string GetPaymentInfo = "api/parkingsession/{sessionId}/payment-info";
            public const string GetTransactionId = "api/parkingsession/transaction-id/{sessionId}";
        }
        #endregion

        #region Password Controller
        public static class Password
        {
            public const string Base = "api/password";
            public const string Reset = "api/password/reset";
            public const string RequestReset = "api/password/request/reset";
            public const string Update = "api/password";
        }
        #endregion

        #region Payment Controller
        public static class Payment
        {
            public const string Base = "api/payment";
            public const string CreateRequest = "api/payment/request";
            public const string GetStatus = "api/payment/{paymentId}/status";
        }
        #endregion

        #region Request Controller
        public static class Request
        {
            public const string Base = "api/request";
            public const string Create = "api/request";
            public const string GetById = "api/request/{id}";
            public const string GetList = "api/request/list";
            public const string GetPage = "api/request/page";
            public const string UpdateStatus = "api/request/status";
            public const string GetMyRequests = "api/request/my-requests";
            public const string GetMyRequestsPage = "api/request/my-requests/page";
            public const string GetAllForAdmin = "api/request/admin/all";
            public const string GetPageForAdmin = "api/request/admin/page";
        }
        #endregion

        #region Shared Vehicle Controller
        public static class SharedVehicle
        {
            public const string Base = "api/sharedvehicle";
            public const string Share = "api/sharedvehicle/share";
            public const string GetPage = "api/sharedvehicle/page";
            public const string GetList = "api/sharedvehicle";
            public const string GetById = "api/sharedvehicle/{vehicleId}";
            public const string Accept = "api/sharedvehicle/{id}/accept";
            public const string Reject = "api/sharedvehicle/{id}/reject";
            public const string Recall = "api/sharedvehicle/{id}/recall";
        }
        #endregion

        #region Shift Diary Controller
        public static class ShiftDiary
        {
            public const string Base = "api/shiftdiary";
            public const string Create = "api/shiftdiary";
            public const string GetDetails = "api/shiftdiary/{id}";
            public const string GetList = "api/shiftdiary/list";
            public const string GetPage = "api/shiftdiary/page";
        }
        #endregion

        #region Staff Controller
        public static class Staff
        {
            public const string Base = "api/staff";
            public const string Register = "api/staff/register";
            public const string Update = "api/staff";
            public const string GetByStaffId = "api/staff/{staffId}";
        }
        #endregion

        #region Subscription Controller
        public static class Subscription
        {
            public const string Base = "api/subscription";
            public const string GetList = "api/subscription";
            public const string GetPage = "api/subscription/page";
            public const string GetDetails = "api/subscription/{id}";
            public const string Create = "api/subscription";
            public const string UpdateStatus = "api/subscription/status";
        }
        #endregion

        #region User Controller
        public static class User
        {
            public const string Base = "api/user";
            public const string GetById = "api/user/{userId}";
            public const string GetByPhoneOrEmail = "api/user/search/{phoneOrEmail}";
            public const string UpdateProfileImage = "api/user/profile-image";
        }
        #endregion

        #region Vehicle Controller
        public static class Vehicle
        {
            public const string Base = "api/vehicle";
            public const string Register = "api/vehicle/register";
            public const string Update = "api/vehicle";
            public const string UpdateStatus = "api/vehicle/status";
            public const string GetById = "api/vehicle/{id}";
            public const string GetByLicensePlate = "api/vehicle/license-plate/{licensePlate}";
            public const string GetPage = "api/vehicle/page";
            public const string GetList = "api/vehicle";
            public const string Delete = "api/vehicle";
            public const string GetMyVehicles = "api/vehicle/my-vehicles";
        }
        #endregion

        #region Vehicle Registration Cert OCR Controller
        public static class VehicleRegistrationCertOcr
        {
            public const string Base = "api/ocr/vehicle-registration";
            public const string ExtractFromBase64 = "api/ocr/vehicle-registration/base64";
            public const string ExtractFromFile = "api/ocr/vehicle-registration/file";
        }
        #endregion

        #region White List Controller
        public static class WhiteList
        {
            public const string Base = "api/whitelist";
            public const string Check = "api/whitelist/check";
            public const string Add = "api/whitelist";
            public const string UpdateExpireDate = "api/whitelist/expire-date";
        }
        #endregion
    }
}