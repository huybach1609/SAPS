using SAPLSServer.Constants;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Base
{
    public class DeleteRequest
    {
        [Required(ErrorMessage = MessageKeys.ID_REQUIRED)]
        public string Id { get; set; } = null!;
    }
}
