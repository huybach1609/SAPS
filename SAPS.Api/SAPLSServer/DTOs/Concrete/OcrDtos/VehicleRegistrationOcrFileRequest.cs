using Microsoft.AspNetCore.Http;
using SAPLSServer.Constants;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.OcrDtos
{
    public class VehicleRegistrationOcrFileRequest
    {
        [Required(ErrorMessage = MessageKeys.FRONT_ID_CARD_IMAGE_REQUIRED)]
        [DataType(DataType.Upload, ErrorMessage = MessageKeys.INVALID_FRONT_VEHICLE_REGISTRATION_CERT_IMAGE_UPLOADED)]
        public IFormFile? FrontImage { get; set; }
        [Required(ErrorMessage = MessageKeys.FRONT_ID_CARD_IMAGE_REQUIRED)]
        [DataType(DataType.Upload, ErrorMessage = MessageKeys.INVALID_BACK_VEHICLE_REGISTRATION_CERT_IMAGE_UPLOADED)]
        public IFormFile? BackImage { get; set; }
    }
}