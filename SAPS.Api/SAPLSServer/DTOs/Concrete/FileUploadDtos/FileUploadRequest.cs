using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.FileUploadDtos
{
    public class FileUploadRequest
    {
        [Required]
        public IFormFile File { get; set; } = null!;

        public string? Container { get; set; }

        public string? SubFolder { get; set; }

        public bool GenerateUniqueFileName { get; set; } = true;

        public Dictionary<string, string>? Metadata { get; set; }
    }
}