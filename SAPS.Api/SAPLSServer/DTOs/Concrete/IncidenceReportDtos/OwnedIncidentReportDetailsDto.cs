using SAPLSServer.DTOs.Concrete.AttachedFileDtos;
using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.IncidenceReportDtos
{
    public class OwnedIncidentReportDetailsDto : IncidentReportSummaryDto
    {
        public string Description { get; set; }
        public GetAttachedFileDto[]? Attachments { get; set; }
        public OwnedIncidentReportDetailsDto(IncidenceReport incidentReport, GetAttachedFileDto[]? attachments = null) : base(incidentReport)
        {
            Description = incidentReport.Description;
            Attachments = attachments;
        }
    }
}
