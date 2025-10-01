using SAPLDesktopApp.DTOs.Base;
using System;

namespace SAPLDesktopApp.DTOs.Concrete.IncidenceReportDtos
{
    public class IncidentReportSummaryDto : GetResult
    {
        public string Header { get; set; } = null!;

        public DateTime ReportedDate { get; set; }
        public string Priority { get; set; } = null!;
        public string Status { get; set; } = null!;
    }
}
