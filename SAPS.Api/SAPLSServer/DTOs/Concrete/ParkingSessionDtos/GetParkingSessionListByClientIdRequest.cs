using SAPLSServer.Constants;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.ParkingSessionDtos
{
    public class GetParkingSessionListByClientIdRequest : GetOwnedParkingSessionListRequest
    {
        [Required(ErrorMessage = MessageKeys.CLIENT_ID_REQUIRED)]
        public string ClientId { get; set; } = string.Empty;
    }
}
