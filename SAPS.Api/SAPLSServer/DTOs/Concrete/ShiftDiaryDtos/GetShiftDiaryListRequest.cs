using System;
using System.ComponentModel.DataAnnotations;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;

namespace SAPLSServer.DTOs.Concrete.ShiftDiaryDtos
{
    public class GetShiftDiaryListRequest : GetListRequest
    {
        [Required(ErrorMessage = MessageKeys.PARKING_LOT_ID_REQUIRED)]
        public string ParkingLotId { get; set; } = null!;
        [DataType(DataType.Date, ErrorMessage = MessageKeys.INVALID_DATE_FORMAT)]
        public DateOnly? UploadedDate { get; set; }
    }
}