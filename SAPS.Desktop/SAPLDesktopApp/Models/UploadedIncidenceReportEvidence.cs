using System;

namespace SAPLDesktopApp.Models
{
    public class UploadedIncidenceReportEvidence
    {
        public string OriginalFileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string FileExtension { get; set; } = string.Empty;
        public string LocalUrl { get; set; } = string.Empty;
        public string TempFilePath { get; set; } = string.Empty; // Path to temp file
        public string? PermanentFilePath { get; set; } // Path after successful upload
        public bool IsUploaded { get; set; } = false; // Track upload status
        public DateTime UploadedAt { get; set; }

        // Helper property to get file size in a readable format
        public string FileSizeText => FormatFileSize(FileSize);

        // Helper property to get the content type for the file
        public string ContentType => GetContentType(FileExtension);

        // Helper property to get the active file path (temp or permanent)
        public string ActiveFilePath => IsUploaded && !string.IsNullOrEmpty(PermanentFilePath) 
            ? PermanentFilePath 
            : TempFilePath;

        private static string FormatFileSize(long bytes)
        {
            string[] suffixes = { "B", "KB", "MB", "GB", "TB" };
            int counter = 0;
            decimal number = bytes;
            while (Math.Round(number / 1024) >= 1)
            {
                number /= 1024;
                counter++;
            }
            return string.Format("{0:n1} {1}", number, suffixes[counter]);
        }

        private static string GetContentType(string extension)
        {
            return extension.ToLowerInvariant() switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".bmp" => "image/bmp",
                ".webp" => "image/webp",
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".ppt" => "application/vnd.ms-powerpoint",
                ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                ".txt" => "text/plain",
                ".csv" => "text/csv",
                ".mp4" => "video/mp4",
                ".avi" => "video/x-msvideo",
                ".mov" => "video/quicktime",
                ".wmv" => "video/x-ms-wmv",
                ".mp3" => "audio/mpeg",
                ".wav" => "audio/wav",
                ".zip" => "application/zip",
                ".rar" => "application/vnd.rar",
                ".7z" => "application/x-7z-compressed",
                _ => "application/octet-stream"
            };
        }
    }
}