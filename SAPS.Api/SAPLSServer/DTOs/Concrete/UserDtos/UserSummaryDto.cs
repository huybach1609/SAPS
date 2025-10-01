using SAPLSServer.DTOs.Base;
using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.UserDtos
{
    public class UserSummaryDto : GetResult
    {
        public string Email { get; set; }
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }
        public UserSummaryDto(User user)
        {
            Id = user.Id;
            Email = user.Email;
            FullName = user.FullName;
            PhoneNumber = user.Phone;
            CreatedAt = user.CreatedAt;
            Status = user.Status;
        }
    }
}
