using SAPLDesktopApp.DTOs.Base;
using System;

namespace SAPLDesktopApp.DTOs.Concrete.AttachedFileDtos
{
    public class GetAttachedFileDto : GetResult
    {
        public string OriginalFileName { get; set; } = null!;
        public long FileSize { get; set; }
        public string FileExtension { get; set; } = null!;
        public string DownloadUrl { get; set; } = null!;
        public DateTime UploadedAt { get; set; }
    }
}
