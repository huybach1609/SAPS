using SAPLDesktopApp.DTOs.Base;
using System.ComponentModel.DataAnnotations;

namespace SAPLDesktopApp.DTOs.Concrete.IncidenceReportDtos
{
    public class UpdateIncidentReportStatusRequest : UpdateRequest
    {
        public string Status { get; set; } = null!;
    }
}
