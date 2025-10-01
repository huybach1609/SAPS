using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;
using SAPLSServer.Constants;

namespace SAPLSServer.DTOs.Concrete.IncidenceReportDtos
{
    public class UpdateIncidentReportStatusRequest : UpdateRequest
    {
        [Required(ErrorMessage = MessageKeys.STATUS_REQUIRED)]
        [EnumDataType(typeof(IncidentReportStatus), ErrorMessage = MessageKeys.INVALID_INCIDENT_REPORT_STATUS)]
        public string Status { get; set; } = null!;
    }
}
