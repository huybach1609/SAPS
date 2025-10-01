using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.OcrDtos
{
    public class VehicleRegistrationOcrRequest
    {
        [Required(ErrorMessage = MessageKeys.FRONT_VEHICLE_REGISTRATION_CERT_BASE_64_REQUIRED)]
        public string FrontImageBase64 { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.BACK_VEHICLE_REGISTRATION_CERT_BASE_64_REQUIRED)]
        public string BackImageBase64 { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.FRONT_IMAGE_FORMAT_REQUIRED)]
        public string FrontImageFormat { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.BACK_IMAGE_FORMAT_REQUIRED)]
        public string BackImageFormat { get; set; } = null!;
    }
}