using SAPLDesktopApp.Helpers;
using System;
using System.Globalization;

namespace SAPLDesktopApp.Models
{
    public class ParkingSessionItem
    {
        public string Id { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public DateTime EntryDateTime { get; set; }
        public DateTime? ExitDateTime { get; set; }
        public decimal Cost { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;

        // Computed properties for UI binding
        public string EntryTime 
        {
            get
            {
                var localTime = EntryDateTime.ToLocalTime();
                return localTime.ToString(Resources.TextResource.Culture);
            }
        }
        
        public string ExitTime
        {
            get
            {
                if (!ExitDateTime.HasValue)
                    return "-";
                var localTime = ExitDateTime.Value.ToLocalTime();
                return localTime.ToString(Resources.TextResource.Culture);
            }
        }
        
        public string Duration 
        {
            get
            {
                if (!ExitDateTime.HasValue)
                    return "-";
                
                var duration = ExitDateTime.Value - EntryDateTime;
                return $"{(int)duration.TotalHours}h {duration.Minutes}m";
            }
        }
        
        public string Fee => Cost > 0 ? Cost.ToString("C", Resources.TextResource.Culture) : "-";

        // Localized properties for UI display
        public string LocalizedStatus => ParkingSessionLocalizationHelper.GetLocalizedStatus(Status);
        public string LocalizedPaymentStatus => ParkingSessionLocalizationHelper.GetLocalizedPaymentStatus(PaymentStatus);
    }
}
