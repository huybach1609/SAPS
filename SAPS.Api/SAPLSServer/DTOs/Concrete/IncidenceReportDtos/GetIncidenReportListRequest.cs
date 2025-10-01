using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.IncidenceReportDtos
{
    public class GetIncidenReportListRequest : GetListRequest
    {
        [Required(ErrorMessage = MessageKeys.PARKING_LOT_ID_REQUIRED)]
        public string ParkingLotId { get; set; } = string.Empty;
        [EnumDataType(typeof(IncidentReportPriority), ErrorMessage = MessageKeys.INVALID_INCIDENT_REPORT_PRIORITY)]
        public string? Priority { get; set; }
        [EnumDataType(typeof(IncidentReportStatus), ErrorMessage = MessageKeys.INVALID_INCIDENT_REPORT_STATUS)]
        public string? Status { get; set; } 
        [DataType(DataType.Date, ErrorMessage = MessageKeys.INVALID_DATE_FORMAT)]
        public DateOnly? StartDate { get; set; }
        [DataType(DataType.Date, ErrorMessage = MessageKeys.INVALID_DATE_FORMAT)]
        public DateOnly? EndDate { get; set; }
    }
}
