using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.RequestDtos
{
    public class GetRequestListByUserIdRequest : GetListRequest
    {
        [Required(ErrorMessage = MessageKeys.USER_ID_REQUIRED)]
        public string UserId { get; set; } = string.Empty;
        [DataType(DataType.Date, ErrorMessage = MessageKeys.INVALID_DATE_FORMAT)]
        public DateOnly? StartDate { get; set; }
        [DataType(DataType.Date, ErrorMessage = MessageKeys.INVALID_DATE_FORMAT)]
        public DateOnly? EndDate { get; set; }
        [EnumDataType(typeof(RequestStatus), ErrorMessage = MessageKeys.INVALID_REQUEST_STATUS)]
        public string? Status { get; set; }
    }
}
