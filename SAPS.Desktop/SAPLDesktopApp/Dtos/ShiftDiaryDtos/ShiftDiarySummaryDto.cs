using SAPLDesktopApp.DTOs.Base;
using System;

namespace SAPLDesktopApp.DTOs.Concrete.ShiftDiaryDtos
{
    public class ShiftDiarySummaryDto : GetResult
    {
        public string Header { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public string SenderName { get; set; } = null!;
    }
}
