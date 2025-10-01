using SAPLSServer.DTOs.Concrete.AttachedFileDtos;
using SAPLSServer.DTOs.Concrete.UserDtos;
using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.IncidenceReportDtos
{
    public class IncidentReportDetailsDto : OwnedIncidentReportDetailsDto
    {
        public StaffProfileSummaryDto? Reporter { get; set; }

        public IncidentReportDetailsDto(IncidenceReport incidentReport, GetAttachedFileDto[]? attachments = null) 
            : base(incidentReport, attachments)
        {
            Description = incidentReport.Description;
            if (incidentReport.Reporter != null)
            {
                Reporter = new StaffProfileSummaryDto(incidentReport.Reporter);
            }
        }
    }
}
