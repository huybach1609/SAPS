using SAPLSServer.Constants;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.ParkingLotShiftDtos
{
    public class CreateParkingLotShiftRequest
    {
        [Required(ErrorMessage = MessageKeys.PARKING_LOT_ID_REQUIRED)]
        public string ParkingLotId { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.SHIFT_START_TIME_REQUIRED)]
        public int StartTime { get; set; }
        [Required(ErrorMessage = MessageKeys.SHIFT_END_TIME_REQUIRED)]
        public int EndTime { get; set; }
        [Required(ErrorMessage = MessageKeys.SHIFT_TYPE_REQUIRED)]
        public string ShiftType { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.SHIFT_WORK_DAYS_REQUIRED)]
        public string DayOfWeeks { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.SHIFT_STATUS_REQUIRED)]
        public string Status { get; set; } = null!;
        public string? Notes { get; set; }
        [Required(ErrorMessage = MessageKeys.SHIFT_STAFFS_REQUIRED)]
        public List<string> StaffIds { get; set; } = new();
    }
}