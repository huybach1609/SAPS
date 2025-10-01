using System;
using ReactiveUI;
using SAPLDesktopApp.Resources;

namespace SAPLDesktopApp.Models
{
    public class EvidenceFileInfo : ReactiveObject
    {
        private bool _isDownloaded;
        private bool _isDownloading;
        private string? _localFilePath;

        public IncidenceReportEvidence Evidence { get; set; } = null!;

        public bool IsDownloaded
        {
            get => _isDownloaded;
            set
            {
                this.RaiseAndSetIfChanged(ref _isDownloaded, value);
                this.RaisePropertyChanged(nameof(DisplayButtonText));
                this.RaisePropertyChanged(nameof(DownloadStatusText));
                this.RaisePropertyChanged(nameof(DownloadStatusColor));
                this.RaisePropertyChanged(nameof(ButtonBackgroundColor));
            }
        }

        public string? LocalFilePath
        {
            get => _localFilePath;
            set => this.RaiseAndSetIfChanged(ref _localFilePath, value);
        }

        public bool IsDownloading
        {
            get => _isDownloading;
            set
            {
                this.RaiseAndSetIfChanged(ref _isDownloading, value);
                this.RaisePropertyChanged(nameof(DisplayButtonText));
                this.RaisePropertyChanged(nameof(CanInteract));
            }
        }

        // Display properties for the UI using TextResource
        public string DisplayButtonText => IsDownloading 
            ? TextResource.BtnDownloading 
            : (IsDownloaded ? TextResource.BtnOpen : TextResource.BtnDownload);
            
        public bool CanInteract => !IsDownloading;
        
        public string DownloadStatusText => IsDownloaded 
            ? TextResource.StatusDownloaded 
            : TextResource.StatusNotDownloaded;
            
        public string DownloadStatusColor => IsDownloaded ? "#4CAF50" : "#9E9E9E"; // Green for downloaded, Gray for not downloaded
        public string ButtonBackgroundColor => IsDownloaded ? "#4CAF50" : "#2196F3"; // Green for Open, Blue for Download

        // Formatted file information
        public string FormattedFileSize => FormatFileSize(Evidence?.FileSize ?? 0);
        public string FormattedUploadDate => Evidence?.UploadedAt.ToString("dd/MM/yyyy HH:mm") ?? "";

        private static string FormatFileSize(long bytes)
        {
            if (bytes == 0) return "0 B";
            
            string[] suffixes = { "B", "KB", "MB", "GB", "TB" };
            int counter = 0;
            decimal number = bytes;
            while (Math.Round(number / 1024) >= 1)
            {
                number /= 1024;
                counter++;
            }
            return $"{number:n1} {suffixes[counter]}";
        }
    }
}