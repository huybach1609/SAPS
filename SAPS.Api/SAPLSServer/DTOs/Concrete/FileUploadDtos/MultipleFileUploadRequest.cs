using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.FileUploadDtos
{
    public class MultipleFileUploadRequest
    {
        [Required]
        [MinLength(1, ErrorMessage = "At least one file is required")]
        public List<IFormFile> Files { get; set; } = new();

        public string? Container { get; set; }

        public string? SubFolder { get; set; }

        public bool GenerateUniqueFileName { get; set; } = true;

        public Dictionary<string, string>? Metadata { get; set; }
    }
}