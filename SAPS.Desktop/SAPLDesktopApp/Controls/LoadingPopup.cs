using Avalonia;
using Avalonia.Controls;
using SAPLDesktopApp.ViewModels;
using SAPLDesktopApp.Views;
using System;

namespace SAPLDesktopApp.Controls
{
    /// <summary>
    /// Simplified loading popup content control (no overlay logic - handled by PopupHost)
    /// </summary>
    public class LoadingPopup : ContentControl
    {
        /// <summary>
        /// Defines the LoadingMessage property
        /// </summary>
        public static readonly StyledProperty<string> LoadingMessageProperty =
            AvaloniaProperty.Register<LoadingPopup, string>(nameof(LoadingMessage), "Loading...");

        /// <summary>
        /// Defines the LoadingDescription property
        /// </summary>
        public static readonly StyledProperty<string> LoadingDescriptionProperty =
            AvaloniaProperty.Register<LoadingPopup, string>(nameof(LoadingDescription), "");

        /// <summary>
        /// Defines the IsIndeterminate property
        /// </summary>
        public static readonly StyledProperty<bool> IsIndeterminateProperty =
            AvaloniaProperty.Register<LoadingPopup, bool>(nameof(IsIndeterminate), true);

        /// <summary>
        /// Defines the Progress property
        /// </summary>
        public static readonly StyledProperty<double> ProgressProperty =
            AvaloniaProperty.Register<LoadingPopup, double>(nameof(Progress), 0);

        /// <summary>
        /// Gets or sets the loading message
        /// </summary>
        public string LoadingMessage
        {
            get => GetValue(LoadingMessageProperty);
            set => SetValue(LoadingMessageProperty, value);
        }

        /// <summary>
        /// Gets or sets the loading description
        /// </summary>
        public string LoadingDescription
        {
            get => GetValue(LoadingDescriptionProperty);
            set => SetValue(LoadingDescriptionProperty, value);
        }

        /// <summary>
        /// Gets or sets whether progress is indeterminate
        /// </summary>
        public bool IsIndeterminate
        {
            get => GetValue(IsIndeterminateProperty);
            set => SetValue(IsIndeterminateProperty, value);
        }

        /// <summary>
        /// Gets or sets the progress value (0-100)
        /// </summary>
        public double Progress
        {
            get => GetValue(ProgressProperty);
            set => SetValue(ProgressProperty, value);
        }

        private LoadingView? _loadingView;
        private LoadingViewModel? _loadingViewModel;

        static LoadingPopup()
        {
            LoadingMessageProperty.Changed.AddClassHandler<LoadingPopup>((popup, e) => popup.UpdateLoadingView());
            LoadingDescriptionProperty.Changed.AddClassHandler<LoadingPopup>((popup, e) => popup.UpdateLoadingView());
            IsIndeterminateProperty.Changed.AddClassHandler<LoadingPopup>((popup, e) => popup.UpdateLoadingView());
            ProgressProperty.Changed.AddClassHandler<LoadingPopup>((popup, e) => popup.UpdateLoadingView());
        }

        public LoadingPopup()
        {
            InitializeLoadingView();
        }

        private void InitializeLoadingView()
        {
            _loadingViewModel = new LoadingViewModel();
            _loadingView = new LoadingView
            {
                DataContext = _loadingViewModel
            };

            Content = _loadingView;
            UpdateLoadingView();
        }

        private void UpdateLoadingView()
        {
            if (_loadingViewModel == null) return;

            _loadingViewModel.Message = LoadingMessage;
            _loadingViewModel.Description = LoadingDescription;
            _loadingViewModel.IsIndeterminate = IsIndeterminate;
            _loadingViewModel.Progress = Progress;
            _loadingViewModel.ShowProgressText = !IsIndeterminate;
        }

        /// <summary>
        /// Update loading status
        /// </summary>
        public void UpdateStatus(string message, string description = "")
        {
            LoadingMessage = message;
            LoadingDescription = description;
        }

        /// <summary>
        /// Update progress
        /// </summary>
        public void UpdateProgress(double progress, string? message = null)
        {
            IsIndeterminate = false;
            Progress = Math.Clamp(progress, 0, 100);

            if (!string.IsNullOrEmpty(message))
            {
                LoadingMessage = message;
            }
        }
    }
}