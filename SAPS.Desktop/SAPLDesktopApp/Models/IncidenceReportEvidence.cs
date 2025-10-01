using System;

namespace SAPLDesktopApp.Models
{
    public class IncidenceReportEvidence
    {
        public string OriginalFileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string FileExtension { get; set; } = string.Empty;
        public string DownloadUrl { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
    }
}
