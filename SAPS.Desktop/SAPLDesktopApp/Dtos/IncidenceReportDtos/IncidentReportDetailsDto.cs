using SAPLDesktopApp.DTOs.Concrete.UserDtos;

namespace SAPLDesktopApp.DTOs.Concrete.IncidenceReportDtos
{
    public class IncidentReportDetailsDto : OwnedIncidentReportDetailsDto
    {
        public StaffProfileSummaryDto Reporter { get; set; } = null!;
    }
}
