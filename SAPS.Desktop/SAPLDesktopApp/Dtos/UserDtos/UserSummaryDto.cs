using SAPLDesktopApp.DTOs.Base;
using System;

namespace SAPLDesktopApp.DTOs.Concrete.UserDtos
{
    public class UserSummaryDto : GetResult
    {
        public string Email { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; } = null!;
    }
}
