namespace SAPLDesktopApp.Models
{
    public class IncidenceReportDetails : IncidenceReportSummary
    {
        public string Description { get; set; } = string.Empty;
        public IncidenceReportEvidence[] Evidences { get; set; } = [];
    }
}
