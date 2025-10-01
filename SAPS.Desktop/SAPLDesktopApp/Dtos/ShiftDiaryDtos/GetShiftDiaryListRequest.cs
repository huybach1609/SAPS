using System;
using System.ComponentModel.DataAnnotations;

namespace SAPLDesktopApp.DTOs.Concrete.ShiftDiaryDtos
{
    public class GetShiftDiaryListRequest
    {
        public string ParkingLotId { get; set; } = null!;
        public DateOnly? UploadedDate { get; set; }
    }
}