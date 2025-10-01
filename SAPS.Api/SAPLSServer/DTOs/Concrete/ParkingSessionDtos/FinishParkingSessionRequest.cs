using System.ComponentModel.DataAnnotations;
using SAPLSServer.Constants;

namespace SAPLSServer.DTOs.Concrete.ParkingSessionDtos
{
    public class FinishParkingSessionRequest
    {
        [Required(ErrorMessage = MessageKeys.VEHICLE_LICENSE_PLATE_REQUIRED)]
        public string VehicleLicensePlate { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.PARKING_LOT_ID_REQUIRED)]
        public string ParkingLotId { get; set; } = null!;
        [DataType(DataType.Upload, ErrorMessage = MessageKeys.INVALID_FRONT_CAPTURE_IMAGE_UPLOADED)]
        public IFormFile? ExitFrontCapture { get; set; } = null!;
        [DataType(DataType.Upload, ErrorMessage = MessageKeys.INVALID_BACK_CAPTURE_IMAGE_UPLOADED)]
        public IFormFile? ExitBackCapture { get; set; } = null!;
    }
}
