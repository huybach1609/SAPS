using SAPLSServer.Constants;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Base
{
    public class GetDetailsRequest
    {
        [Required(ErrorMessage = MessageKeys.ID_REQUIRED)]
        public string Id { get; set; } = null!;
    }
}
