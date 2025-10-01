namespace SAPLSServer.Constants
{
    public static class UrlPaths
    {
        public const string PAYMENT_REQUEST_PATH = "/v2/payment-requests";
        public const string PAYMENT_CANCEL_PATH = "/cancel";
        public const string CANCEL_URL = "https://your-cancel-url.com/";
        public const string RETURN_URL = "https://your-success-url.com/";

        public const string RESET_PASSWORD_PATH = "/api/password/reset";
        public const string CONFIRM_EMAIL_PATH = "/api/emailconfirmation/confirm-email";
        public const string PARKING_SESSION_PAYMENT_RETURN_PATH = "/api/parkingsession/return";
        public const string PARKING_LOT_SUB_PAYMENT_RETURN_PATH = "/api/parkingsession/cancel";
        public const string PARKING_SESSION_PAYMENT_CANCEL_PATH = "/api/parkinglot/subscription/return";
        public const string PARKING_LOT_SUB_PAYMENT_CANCEL_PATH = "/api/parkinglot/subscription/cancel";
    }
}
