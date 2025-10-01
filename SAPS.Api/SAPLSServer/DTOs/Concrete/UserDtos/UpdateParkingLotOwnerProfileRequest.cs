using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.UserDtos
{
    public class UpdateParkingLotOwnerProfileRequest : UpdateRequest
    {
        [Required(ErrorMessage = MessageKeys.PARKING_LOT_OWNER_ID_REQUIRED)]
        public string ParkingLotOwnerId { get; set; } = null!;
        public string? ClientKey { get; set; }
        public string? ApiKey { get; set; }
        public string? CheckSumKey { get; set; }
    }
}
