namespace SAPLSServer.DTOs.Concrete.FileUploadDtos
{
    public class FileUploadResponse
    {
        public string FileId { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public string CloudUrl { get; set; } = string.Empty;
        public string CdnUrl { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string FileExtension { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public string FileHash { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
        public string Container { get; set; } = string.Empty;
    }
}