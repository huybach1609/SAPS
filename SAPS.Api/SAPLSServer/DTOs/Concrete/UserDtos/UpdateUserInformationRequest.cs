using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;
using SAPLSServer.Constants;

namespace SAPLSServer.DTOs.Concrete.UserDtos
{
    public abstract class UpdateUserInformationRequest : UpdateRequest
    {
        [Required(ErrorMessage = MessageKeys.FULL_NAME_REQUIRED)]
        public string FullName { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.PHONE_NUMBER_REQUIRED)]
        [Length(minimumLength: 10, maximumLength: 15, ErrorMessage = MessageKeys.PHONE_NUMBER_LENGTH)]
        [RegularExpression(@"^\d+$", ErrorMessage = MessageKeys.PHONE_NUMBER_DIGITS_ONLY)]
        public string Phone { get; set; } = null!;
    }
}