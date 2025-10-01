using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.UserDtos
{
    public class UserDetailsDto : UserSummaryDto
    {
        public string? GoogleId { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string Phone { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string Role { get; set; }
        public UserDetailsDto(User user) : base(user)
        {
            GoogleId = user.GoogleId;
            ProfileImageUrl = user.ProfileImageUrl;
            Phone = user.Phone;
            Role = user.Role;
            UpdatedAt = user.UpdatedAt;
        }
    }
}
