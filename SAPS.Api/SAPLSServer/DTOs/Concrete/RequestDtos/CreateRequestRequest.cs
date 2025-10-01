using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;
using SAPLSServer.Constants;

namespace SAPLSServer.DTOs.Concrete.RequestDtos
{
    public class CreateRequestRequest
    {
        [Required(ErrorMessage = MessageKeys.SHIFT_DIARY_HEADER_REQUIRED)]
        public string Header { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.SHIFT_DIARY_BODY_REQUIRED)]
        public string Description { get; set; } = null!;
        [EnumDataType(typeof(RequestDataType), ErrorMessage = MessageKeys.INVALID_REQUEST_DATA_TYPE)]
        public string? DataType { get; set; }
        public string? Data { get; set; }
        public IFormFile[]? Attachments { get; set; }
    }
}
