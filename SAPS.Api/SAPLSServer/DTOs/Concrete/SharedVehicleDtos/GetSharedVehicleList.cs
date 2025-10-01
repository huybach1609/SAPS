using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.SharedVehicleDtos
{
    public class GetSharedVehicleList : GetListRequest
    {
        [Required(ErrorMessage = MessageKeys.SHARED_PERSON_ID_REQUIRED)]
        public string SharedPersonId { get; set; } = string.Empty;
    }
}
