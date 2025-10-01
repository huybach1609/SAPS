using System;
using System.Collections.Generic;

namespace SAPLSServer.DTOs.Concrete.ParkingLotShiftDtos
{
    public class ParkingLotShiftDto
    {
        public string Id { get; set; } = null!;
        public string ParkingLotId { get; set; } = null!;
        public int StartTime { get; set; }
        public int EndTime { get; set; }
        public string ShiftType { get; set; } = null!;
        public string? DayOfWeeks { get; set; }
        public DateOnly? SpecificDate { get; set; }
        public bool IsActive { get; set; }
        public string Status { get; set; } = null!;
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<string> StaffIds { get; set; } = new();
    }
}