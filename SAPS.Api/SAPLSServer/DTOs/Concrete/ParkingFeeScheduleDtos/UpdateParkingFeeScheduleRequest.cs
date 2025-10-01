using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.ParkingFeeScheduleDtos
{
    public class UpdateParkingFeeScheduleRequest : UpdateRequest
    {
        [Required(ErrorMessage = MessageKeys.FEE_SCHEDULE_START_TIME_REQUIRED)]
        [Range(minimum: 0, maximum: 1439, ErrorMessage = MessageKeys.INVALID_FEE_SCHEDULE_START_TIME)]
        public int StartTime { get; set; }

        [Required(ErrorMessage = MessageKeys.FEE_SCHEDULE_END_TIME_REQUIRED)]
        [Range(minimum: 0, maximum: 1439, ErrorMessage = MessageKeys.INVALID_FEE_SCHEDULE_END_TIME)]
        public int EndTime { get; set; }

        [Required(ErrorMessage = MessageKeys.INITIAL_FEE_REQUIRED)]
        [Range(minimum: 0, maximum: int.MaxValue, ErrorMessage = MessageKeys.INVALID_INITIAL_FEE)]
        public decimal InitialFee { get; set; }
        [Required(ErrorMessage = MessageKeys.INITIAL_MINUTES_REQUIRED)]
        [Range(minimum: 0, maximum: int.MaxValue, ErrorMessage = MessageKeys.INVALID_INITIAL_MINUTES)]
        public int InitialMinutes { get; set; }

        [Range(minimum: 0, maximum: int.MaxValue, ErrorMessage = MessageKeys.INVALID_ADDITIONAL_FEE)]
        public decimal? AdditionalFee { get; set; }
        [Range(minimum: 0, maximum: int.MaxValue, ErrorMessage = MessageKeys.INVALID_ADDITIONAL_MINUTES)]
        public int? AdditionalMinutes { get; set; }
        [Required(ErrorMessage = MessageKeys.DAY_OF_WEEKS_REQUIRED)]
        public string DayOfWeeks { get; set; } = null!;

        [Required(ErrorMessage = MessageKeys.VEHICLE_TYPE_REQUIRED)]
        [EnumDataType(typeof(VehicleType), ErrorMessage = MessageKeys.INVALID_VEHICLE_TYPE)]
        public string ForVehicleType { get; set; } = string.Empty;

        [Required(ErrorMessage = MessageKeys.PARKING_LOT_ID_REQUIRED)]
        public string ParkingLotId { get; set; } = string.Empty;

        [Required]
        public bool IsActive { get; set; }
    }
}