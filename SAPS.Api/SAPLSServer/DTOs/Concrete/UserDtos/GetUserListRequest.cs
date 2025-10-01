using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.UserDtos
{
    public abstract class GetUserListRequest : GetListRequest
    {
        [EnumDataType(typeof(UserStatus), ErrorMessage = MessageKeys.INVALID_USER_STATUS)]
        public string? Status { get; set; }
    }
}
