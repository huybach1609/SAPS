using SAPLSServer.DTOs.Base;
using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.IncidenceReportDtos
{
    public class IncidentReportSummaryDto : GetResult
    {
        public string Header { get; set; }

        public DateTime ReportedDate { get; set; }
        public string Priority { get; set; }
        public string Status { get; set; }
        public IncidentReportSummaryDto(IncidenceReport incidentReport)
        {
            Id = incidentReport.Id;
            Header = incidentReport.Header;
            ReportedDate = incidentReport.ReportedDate;
            Priority = incidentReport.Priority;
            Status = incidentReport.Status;
        }
    }
}
