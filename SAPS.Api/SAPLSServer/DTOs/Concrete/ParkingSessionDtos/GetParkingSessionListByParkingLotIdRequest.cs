using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.ParkingLotDtos;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.ParkingSessionDtos
{
    public class GetParkingSessionListByParkingLotIdRequest : GetOwnedParkingSessionListRequest
    {
        [Required(ErrorMessage = MessageKeys.PARKING_LOT_ID_REQUIRED)]
        public string ParkingLotId { get; set; } = string.Empty;
    }
}
