using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using SAPLSServer.ValidationAttributes;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.UserDtos
{
    public class VerifyLevelTwoClientRequest : UpdateRequest
    {
        [Required(ErrorMessage = MessageKeys.FRONT_ID_CARD_IMAGE_REQUIRED)]
        [DataType(DataType.Upload, ErrorMessage = MessageKeys.INVALID_FRONT_ID_CARD_IMAGE_UPLOADED)]
        public IFormFile FrontCitizenCardImage { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.BACK_ID_CARD_IMAGE_REQUIRED)]
        [DataType(DataType.Upload, ErrorMessage = MessageKeys.INVALID_BACK_ID_CARD_IMAGE_UPLOADED)]
        public IFormFile BackCitizenCardImage { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.CITIZEN_ID_REQUIRED)]
        [VietnameseCitizenId(ErrorMessage = MessageKeys.INVALID_CITIZEN_ID)]
        public string CitizenId { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.DATE_OF_BIRTH_REQUIRED)]
        [DataType(DataType.Date, ErrorMessage = MessageKeys.INVALID_DATE_FORMAT)]
        public DateOnly DateOfBirth { get; set; }
        [Required(ErrorMessage = MessageKeys.SEX_REQUIRED)]
        public bool Sex { get; set; }
        [Required(ErrorMessage = MessageKeys.NATIONALITY_REQUIRED)]
        public string Nationality { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.PLACE_OF_ORIGIN_REQUIRED)]
        public string PlaceOfOrigin { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.PLACE_OF_RESIDENCE_REQUIRED)]
        public string PlaceOfResidence { get; set; } = null!;
    }
}
