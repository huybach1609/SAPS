using System.ComponentModel.DataAnnotations;
using SAPLSServer.Constants;

namespace SAPLSServer.DTOs.Concrete.ShiftDiaryDtos
{
    public class CreateShiftDiaryRequest
    {
        [Required(ErrorMessage = MessageKeys.SHIFT_DIARY_HEADER_REQUIRED)]
        public string Header { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.SHIFT_DIARY_BODY_REQUIRED)]
        public string Body { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.PARKING_LOT_ID_REQUIRED)]
        public string ParkingLotId { get; set; } = null!;
    }
}
