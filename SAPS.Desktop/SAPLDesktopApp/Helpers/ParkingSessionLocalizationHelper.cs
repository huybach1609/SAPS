using SAPLDesktopApp.Constants;
using SAPLDesktopApp.Resources;
using System;

namespace SAPLDesktopApp.Helpers
{
    public static class ParkingSessionLocalizationHelper
    {
        /// <summary>
        /// Gets the localized status text for parking session status
        /// </summary>
        /// <param name="status">The status string from API</param>
        /// <returns>Localized status text</returns>
        public static string GetLocalizedStatus(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
                return TextResource.UnknownText;

            // Handle enum-based status (numeric values)
            if (int.TryParse(status, out int statusValue))
            {
                return statusValue switch
                {
                    (int)ParkingSessionStatus.Parking => TextResource.ParkingStatusParking,
                    (int)ParkingSessionStatus.CheckedOut => TextResource.ParkingStatusCheckedOut,
                    (int)ParkingSessionStatus.Finished => TextResource.ParkingStatusFinished,
                    _ => TextResource.UnknownText
                };
            }

            // Handle string-based status
            return status.ToLowerInvariant() switch
            {
                "parking" => TextResource.ParkingStatusParking,
                "checkedout" => TextResource.ParkingStatusCheckedOut,
                "finished" => TextResource.ParkingStatusFinished,
                _ when status.Equals(ParkingSessionStatus.Parking.ToString(), StringComparison.OrdinalIgnoreCase) => TextResource.ParkingStatusParking,
                _ when status.Equals(ParkingSessionStatus.CheckedOut.ToString(), StringComparison.OrdinalIgnoreCase) => TextResource.ParkingStatusCheckedOut,
                _ when status.Equals(ParkingSessionStatus.Finished.ToString(), StringComparison.OrdinalIgnoreCase) => TextResource.ParkingStatusFinished,
                _ => TextResource.UnknownText
            };
        }

        /// <summary>
        /// Gets the localized payment status text
        /// </summary>
        /// <param name="paymentStatus">The payment status string from API</param>
        /// <returns>Localized payment status text</returns>
        public static string GetLocalizedPaymentStatus(string paymentStatus)
        {
            if (string.IsNullOrWhiteSpace(paymentStatus))
                return TextResource.UnknownText;

            // Handle enum-based payment status (numeric values)
            if (int.TryParse(paymentStatus, out int statusValue))
            {
                return statusValue switch
                {
                    (int)ParkingSessionPayStatus.Paid => TextResource.PaymentStatusPaid,
                    (int)ParkingSessionPayStatus.NotPaid => TextResource.PaymentStatusNotPaid,
                    _ => TextResource.UnknownText
                };
            }

            // Handle string-based payment status
            return paymentStatus.ToLowerInvariant() switch
            {
                "paid" => TextResource.PaymentStatusPaid,
                "notpaid" => TextResource.PaymentStatusNotPaid,
                "pending" => TextResource.PaymentStatusPending,
                _ when paymentStatus.Equals(ParkingSessionPayStatus.Paid.ToString(), StringComparison.OrdinalIgnoreCase) => TextResource.PaymentStatusPaid,
                _ when paymentStatus.Equals(ParkingSessionPayStatus.NotPaid.ToString(), StringComparison.OrdinalIgnoreCase) => TextResource.PaymentStatusNotPaid,
                _ => TextResource.UnknownText
            };
        }
    }
}