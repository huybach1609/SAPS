using SAPLSServer.Constants;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.UserDtos
{
    public class ResetUserPasswordRequest
    {
        [Required(ErrorMessage = MessageKeys.USER_ID_REQUIRED)]
        public string? UserId { get; set; }
        [Required(ErrorMessage = MessageKeys.OTP_REQUIRED)]
        public string? Otp { get; set; }
        [Required(ErrorMessage = MessageKeys.NEW_PASSWORD_REQUIRED)]
        [Length(minimumLength: 8, maximumLength: 24, ErrorMessage = MessageKeys.PASSWORD_LENGTH)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?])(?!.*\s).{8,24}$",
            ErrorMessage = MessageKeys.PASSWORD_COMPLEXITY)]
        public string? NewPassword { get; set; }
    }
}
