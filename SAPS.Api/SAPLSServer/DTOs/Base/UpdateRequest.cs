using SAPLSServer.Constants;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Base
{
    public abstract class UpdateRequest
    {
        [Required(ErrorMessage = MessageKeys.ID_REQUIRED)]
        public string Id { get; set; } = null!;
    }
}
