using System;

namespace SAPLDesktopApp.Models
{
    public class ShiftDiarySummary
    {
        public string Id { get; set; } = null!;
        public string Header { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public string SenderName { get; set; } = null!;
        public string FormattedCreatedAt 
        {
            get
            {
                var localTime = CreatedAt.Kind == DateTimeKind.Utc
                    ? CreatedAt.ToLocalTime()
                    : CreatedAt;
                return localTime.ToString(Resources.TextResource.Culture);
            }
        }

    }
}