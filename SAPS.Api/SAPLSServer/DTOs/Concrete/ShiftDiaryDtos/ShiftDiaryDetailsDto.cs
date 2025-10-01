using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.ShiftDiaryDtos
{
    public class ShiftDiaryDetailsDto : ShiftDiarySummaryDto
    {
        public string Body { get; set; }

        public ShiftDiaryDetailsDto(ShiftDiary shiftDiary) : base(shiftDiary)
        {
            Body = shiftDiary.Body;
        }
    }
}
