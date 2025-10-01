using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.UserDtos
{
    public class UpdateUserProfileImageRequest : UpdateRequest
    {
        [DataType(DataType.Upload, ErrorMessage = MessageKeys.INVALID_PROFILE_IMAGE_UPLOADED)]
        public IFormFile? ProfileImage { get; set; } = null!;
    }
}
