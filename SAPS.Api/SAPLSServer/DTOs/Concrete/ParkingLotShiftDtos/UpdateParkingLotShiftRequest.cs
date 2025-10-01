using System.Collections.Generic;

namespace SAPLSServer.DTOs.Concrete.ParkingLotShiftDtos
{
    public class UpdateParkingLotShiftRequest
    {
        public string Id { get; set; } = null!;
        public int? StartTime { get; set; }
        public int? EndTime { get; set; }
        public string? ShiftType { get; set; }
        public string? DayOfWeeks { get; set; }
        public string? SpecificDate { get; set; }
        public bool? IsActive { get; set; }
        public string? Status { get; set; }
        public string? Notes { get; set; }
        public List<string>? StaffIds { get; set; }
    }
}   