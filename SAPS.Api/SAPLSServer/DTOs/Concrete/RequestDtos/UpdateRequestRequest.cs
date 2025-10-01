using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.RequestDtos
{
    public class UpdateRequestRequest : UpdateRequest
    {
        public string? InternalNote { get; set; }

        public string? ResponseMessage { get; set; }
        [Required(ErrorMessage = MessageKeys.STATUS_REQUIRED)]
        [EnumDataType(typeof(RequestStatus), ErrorMessage = MessageKeys.INVALID_REQUEST_STATUS)]
        public string Status { get; set; } = null!;
    }
}
