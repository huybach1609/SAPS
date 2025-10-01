using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;
using SAPLSServer.Constants;

namespace SAPLSServer.DTOs.Concrete.ParkingSessionDtos
{
    public class CheckInParkingSessionRequest
    {
        [EnumDataType(typeof(VehicleType), ErrorMessage = MessageKeys.INVALID_VEHICLE_TYPE)]
        public string? VehicleType { get; set; }
        [Required(ErrorMessage = MessageKeys.VEHICLE_LICENSE_PLATE_REQUIRED)]
        public string VehicleLicensePlate { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.PARKING_LOT_ID_REQUIRED)]
        public string ParkingLotId { get; set; } = null!;
        [DataType(DataType.Upload, ErrorMessage = MessageKeys.INVALID_FRONT_CAPTURE_IMAGE_UPLOADED)]
        public IFormFile? EntryFrontCapture { get; set; }
        [DataType(DataType.Upload, ErrorMessage = MessageKeys.INVALID_BACK_CAPTURE_IMAGE_UPLOADED)]
        public IFormFile? EntryBackCapture { get; set; }
    }
}
