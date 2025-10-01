using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.UserDtos
{
    public class AdminProfileSummaryDto : UserSummaryDto
    {
        public string AdminId { get; set; }
        public string AdminRole { get; set; }

        public AdminProfileSummaryDto(AdminProfile model) : base(model.User)
        {
            AdminId = model.AdminId;
            AdminRole = model.Role;
        }
    }
}
