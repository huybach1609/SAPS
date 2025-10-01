using ReactiveUI;
using System;
using Avalonia;

namespace SAPLDesktopApp.ViewModels
{
    public class LoadingViewModel : ViewModelBase
    {
        private string _message = "Loading...";
        private string _description = "";
        private bool _isIndeterminate = true;
        private double _progress = 0;
        private bool _showProgressText = false;

        /// <summary>
        /// Main loading message
        /// </summary>
        public string Message
        {
            get => _message;
            set => this.RaiseAndSetIfChanged(ref _message, value);
        }

        /// <summary>
        /// Additional description text
        /// </summary>
        public string Description
        {
            get => _description;
            set => this.RaiseAndSetIfChanged(ref _description, value);
        }

        /// <summary>
        /// Whether to show indeterminate progress (spinning) or determinate progress bar
        /// </summary>
        public bool IsIndeterminate
        {
            get => _isIndeterminate;
            set => this.RaiseAndSetIfChanged(ref _isIndeterminate, value);
        }

        /// <summary>
        /// Progress value (0-100) for determinate progress
        /// </summary>
        public double Progress
        {
            get => _progress;
            set => this.RaiseAndSetIfChanged(ref _progress, value);
        }

        /// <summary>
        /// Whether to show progress percentage text
        /// </summary>
        public bool ShowProgressText
        {
            get => _showProgressText;
            set => this.RaiseAndSetIfChanged(ref _showProgressText, value);
        }

        /// <summary>
        /// Formatted progress text
        /// </summary>
        public string ProgressText => $"{Progress:F0}%";

        /// <summary>
        /// Whether description should be visible
        /// </summary>
        public bool HasDescription => !string.IsNullOrEmpty(Description);

        public LoadingViewModel()
        {
            // Subscribe to progress changes to update progress text
            this.WhenAnyValue(x => x.Progress)
                .Subscribe(_ => this.RaisePropertyChanged(nameof(ProgressText)));

            // Subscribe to description changes to update visibility
            this.WhenAnyValue(x => x.Description)
                .Subscribe(_ => this.RaisePropertyChanged(nameof(HasDescription)));
        }
    }
}