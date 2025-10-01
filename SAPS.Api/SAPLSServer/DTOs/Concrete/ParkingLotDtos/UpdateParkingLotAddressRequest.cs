using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;
using SAPLSServer.Constants;

namespace SAPLSServer.DTOs.Concrete.ParkingLotDtos
{
    public class UpdateParkingLotAddressRequest : UpdateRequest
    {
        [Required(ErrorMessage = MessageKeys.PLACE_OF_RESIDENCE_REQUIRED)]
        public string Address { get; set; } = null!;
    }
}
