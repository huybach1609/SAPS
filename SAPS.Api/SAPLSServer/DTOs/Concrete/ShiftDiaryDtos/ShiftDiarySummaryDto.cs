using SAPLSServer.DTOs.Base;
using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.ShiftDiaryDtos
{
    public class ShiftDiarySummaryDto : GetResult
    {
        public string Header { get; set; }
        public DateTime CreatedAt { get; set; }
        public string SenderName { get; set; }
        public ShiftDiarySummaryDto(ShiftDiary shiftDiary)
        {
            Id = shiftDiary.Id;
            Header = shiftDiary.Header;
            SenderName = shiftDiary.Sender?.User.FullName ?? string.Empty;
            CreatedAt = shiftDiary.CreatedAt;
        }
    }
}
