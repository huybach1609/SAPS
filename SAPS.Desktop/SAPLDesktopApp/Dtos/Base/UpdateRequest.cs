using System.ComponentModel.DataAnnotations;

namespace SAPLDesktopApp.DTOs.Base
{
    public abstract class UpdateRequest
    {
        public string Id { get; set; } = null!;
    }
}
