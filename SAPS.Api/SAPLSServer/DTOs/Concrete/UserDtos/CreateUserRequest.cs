using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;
using SAPLSServer.Constants;

namespace SAPLSServer.DTOs.Concrete.UserDtos
{
    public class CreateUserRequest
    {
        [Required(ErrorMessage = MessageKeys.EMAIL_REQUIRED)]
        [EmailAddress(ErrorMessage = MessageKeys.INVALID_EMAIL_FORMAT)]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = MessageKeys.PASSWORD_REQUIRED)]
        [Length(minimumLength: 8, maximumLength: 24, ErrorMessage = MessageKeys.PASSWORD_LENGTH)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?])(?!.*\s).{8,24}$",
            ErrorMessage = MessageKeys.PASSWORD_COMPLEXITY)]
        public string Password { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.FULL_NAME_REQUIRED)]
        [RegularExpression(@"^[a-zA-Z\s]+$", ErrorMessage = MessageKeys.FULL_NAME_LETTERS_ONLY)]
        public string FullName { get; set; } = null!;

        [Required(ErrorMessage = MessageKeys.PHONE_NUMBER_REQUIRED)]
        [Length(minimumLength: 10, maximumLength: 15, ErrorMessage = MessageKeys.PHONE_NUMBER_LENGTH)]
        [RegularExpression(@"^\d+$", ErrorMessage = MessageKeys.PHONE_NUMBER_DIGITS_ONLY)]
        public string Phone { get; set; } = null!;
        [DataType(DataType.Upload, ErrorMessage = MessageKeys.INVALID_PROFILE_IMAGE_UPLOADED)]
        public IFormFile? ProfileImage { get; set; }
    }
}
