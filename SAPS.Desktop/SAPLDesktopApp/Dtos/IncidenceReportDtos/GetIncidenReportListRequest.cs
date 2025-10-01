using SAPLDesktopApp.DTOs.Base;
using System;

namespace SAPLDesktopApp.DTOs.Concrete.IncidenceReportDtos
{
    public class GetIncidenReportListRequest : GetListRequest
    {
        public string ParkingLotId { get; set; } = string.Empty;
        public string? Priority { get; set; }
        public string? Status { get; set; } 
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
    }
}
