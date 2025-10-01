using SAPLDesktopApp.Helpers;
using System;

namespace SAPLDesktopApp.Models
{
    public class IncidenceReportSummary
    {
        public string Id { get; set; } = string.Empty;
        public string Header { get; set; } = string.Empty;
        public DateTime ReportedDate { get; set; }
        public string Priority { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string ReporterName { get; set; } = string.Empty;

        // Localized properties for UI display
        public string FormattedReportedDate
        {
            get
            {
                var localTime = ReportedDate.Kind == DateTimeKind.Utc
                    ? ReportedDate.ToLocalTime()
                    : ReportedDate;
                return localTime.ToString(Resources.TextResource.Culture);
            }
        }
        public string LocalizedPriority => IncidentReportLocalizationHelper.GetLocalizedPriority(Priority);
        public string LocalizedStatus => IncidentReportLocalizationHelper.GetLocalizedStatus(Status);
    }
}
