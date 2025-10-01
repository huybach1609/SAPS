using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.ParkingLotDtos
{
    public class GetParkingLotListRequest : GetListRequest
    {
        [Required(ErrorMessage = MessageKeys.PARKING_LOT_OWNER_ID_REQUIRED)]
        public string ParkingLotOwnerId { get; set; } = string.Empty;
        [EnumDataType(typeof(ParkingLotStatus), ErrorMessage = MessageKeys.INVALID_PARKING_LOT_STATUS)]
        public string? Status { get; set; }
    }
}