using System;

namespace SAPLDesktopApp.DTOs.Concrete.UserDtos
{
    public class UserDetailsDto : UserSummaryDto
    {
        public string? GoogleId { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string Phone { get; set; } = null!;
        public DateTime UpdatedAt { get; set; }
        public string Role { get; set; } = null!;
    }
}
