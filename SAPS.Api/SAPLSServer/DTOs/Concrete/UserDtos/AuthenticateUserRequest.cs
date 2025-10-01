using SAPLSServer.Constants;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.UserDtos
{
    public class AuthenticateUserRequest
    {
        [EmailAddress(ErrorMessage = MessageKeys.INVALID_EMAIL_FORMAT)]
        public string? Email { get; set; }
        [Required(ErrorMessage =  MessageKeys.PASSWORD_REQUIRED)]
        public string? Password { get; set; }
        public bool RememberMe { get; set; } = false;
    }
}
