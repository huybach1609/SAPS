using SAPLSServer.Constants;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.UserDtos
{
    public class GoogleAuthRequest
    {
        [Required(ErrorMessage = MessageKeys.ACCESS_TOKEN_REQUIRED)]
        public string AccessToken { get; set; } = string.Empty;
    }
}
