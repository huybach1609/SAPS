using SAPLDesktopApp.DTOs.Concrete.AttachedFileDtos;

namespace SAPLDesktopApp.DTOs.Concrete.IncidenceReportDtos
{
    public class OwnedIncidentReportDetailsDto : IncidentReportSummaryDto
    {
        public string Description { get; set; } = null!;
        public GetAttachedFileDto[]? Attachments { get; set; }
    }
}
