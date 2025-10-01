using SAPLDesktopApp.DTOs.Base;

namespace SAPLDesktopApp.DTOs.Concrete.UserDtos
{
    public class UpdateUserPasswordRequest : UpdateRequest
    {
        public string OldPassword { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }
}
