using SAPLSServer.DTOs.Base;
using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.AttachedFileDtos
{
    public class GetAttachedFileDto : GetResult
    {
        public string OriginalFileName { get; set; }
        public long FileSize { get; set; }
        public string FileExtension { get; set; }
        public string DownloadUrl { get; set; }
        public DateTime UploadedAt { get; set; }
        public GetAttachedFileDto(AttachedFile attachedFile)
        {
            Id = attachedFile.Id;
            OriginalFileName = attachedFile.OriginalFileName;
            FileSize = attachedFile.FileSize;
            FileExtension = attachedFile.FileExtension;
            DownloadUrl = attachedFile.CdnUrl;
            UploadedAt = attachedFile.UploadAt;
        }
    }
}
