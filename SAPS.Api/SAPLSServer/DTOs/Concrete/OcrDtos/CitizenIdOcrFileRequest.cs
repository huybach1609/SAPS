using SAPLSServer.Constants;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.OcrDtos
{
    public class CitizenIdOcrFileRequest
    {
        [Required(ErrorMessage = MessageKeys.FRONT_ID_CARD_IMAGE_REQUIRED)]
        [DataType(DataType.Upload, ErrorMessage = MessageKeys.INVALID_FRONT_ID_CARD_IMAGE_UPLOADED)]
        public IFormFile? FrontImage { get; set; }
        [Required(ErrorMessage = MessageKeys.BACK_ID_CARD_IMAGE_REQUIRED)]
        [DataType(DataType.Upload, ErrorMessage = MessageKeys.INVALID_BACK_ID_CARD_IMAGE_UPLOADED)]
        public IFormFile? BackImage { get; set; }
    }
}