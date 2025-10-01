using SAPLSServer.Constants;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.WhiteListDtos
{
    public class AddAttendantToWhiteListRequest
    {
        [Required(ErrorMessage = MessageKeys.PARKING_LOT_ID_REQUIRED)]
        public string ParkingLotId { get; set; } = null!;
        [Required(ErrorMessage = MessageKeys.CLIENT_ID_REQUIRED)]
        public string ClientId { get; set; } = null!;
        [DataType(DataType.DateTime)]
        public DateTime? ExpireAt { get; set; }
    }
}
