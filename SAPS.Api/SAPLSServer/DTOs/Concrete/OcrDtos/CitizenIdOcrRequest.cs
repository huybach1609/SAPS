using SAPLSServer.Constants;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.OcrDtos
{
    public class CitizenIdOcrRequest
    {
        [Required(ErrorMessage = MessageKeys.FRONT_ID_CARD_BASE_64_REQUIRED)]
        public string FrontImageBase64 { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.BACK_ID_CARD_BASE_64_REQUIRED)]
        public string BackImageBase64 { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.FRONT_IMAGE_FORMAT_REQUIRED)]
        public string FrontImageFormat { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.BACK_IMAGE_FORMAT_REQUIRED)]
        public string BackImageFormat { get; set; } = null!;
    }
}