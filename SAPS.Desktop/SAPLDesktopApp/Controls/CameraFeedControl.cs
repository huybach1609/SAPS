using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Primitives;
using Avalonia.Media.Imaging;
using ReactiveUI;
using SAPLDesktopApp.Models;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Windows.Input;

namespace SAPLDesktopApp.Controls
{
    /// <summary>
    /// A simple camera feed control that displays multiple camera views in a grid
    /// </summary>
    public class CameraFeedControl : TemplatedControl
    {
        private bool _isTemplateApplied = false;

        /// <summary>
        /// Front Entrance Camera Image
        /// </summary>
        public static readonly StyledProperty<Bitmap?> FrontEntranceImageProperty =
            AvaloniaProperty.Register<CameraFeedControl, Bitmap?>(nameof(FrontEntranceImage));

        public Bitmap? FrontEntranceImage
        {
            get => GetValue(FrontEntranceImageProperty);
            set => SetValue(FrontEntranceImageProperty, value);
        }

        /// <summary>
        /// Back Entrance Camera Image
        /// </summary>
        public static readonly StyledProperty<Bitmap?> BackEntranceImageProperty =
            AvaloniaProperty.Register<CameraFeedControl, Bitmap?>(nameof(BackEntranceImage));

        public Bitmap? BackEntranceImage
        {
            get => GetValue(BackEntranceImageProperty);
            set => SetValue(BackEntranceImageProperty, value);
        }

        /// <summary>
        /// Front Exit Camera Image
        /// </summary>
        public static readonly StyledProperty<Bitmap?> FrontExitImageProperty =
            AvaloniaProperty.Register<CameraFeedControl, Bitmap?>(nameof(FrontExitImage));

        public Bitmap? FrontExitImage
        {
            get => GetValue(FrontExitImageProperty);
            set => SetValue(FrontExitImageProperty, value);
        }

        /// <summary>
        /// Back Exit Camera Image
        /// </summary>
        public static readonly StyledProperty<Bitmap?> BackExitImageProperty =
            AvaloniaProperty.Register<CameraFeedControl, Bitmap?>(nameof(BackExitImage));

        public Bitmap? BackExitImage
        {
            get => GetValue(BackExitImageProperty);
            set => SetValue(BackExitImageProperty, value);
        }

        /// <summary>
        /// Footer Buttons
        /// </summary>
        public static readonly DirectProperty<CameraFeedControl, IList<CameraButton>> FooterButtonsProperty =
            AvaloniaProperty.RegisterDirect<CameraFeedControl, IList<CameraButton>>(
                nameof(FooterButtons),
                o => o.FooterButtons,
                (o, v) => o.FooterButtons = v);

        private IList<CameraButton> _footerButtons = new ObservableCollection<CameraButton>();

        public IList<CameraButton> FooterButtons
        {
            get => _footerButtons;
            set => SetAndRaise(FooterButtonsProperty, ref _footerButtons, value);
        }

        // Add refresh command property
        public static readonly DirectProperty<CameraFeedControl, ICommand?> RefreshCommandProperty =
            AvaloniaProperty.RegisterDirect<CameraFeedControl, ICommand?>(
                nameof(RefreshCommand),
                o => o.RefreshCommand,
                (o, v) => o.RefreshCommand = v);

        private ICommand? _refreshCommand;

        public ICommand? RefreshCommand
        {
            get => _refreshCommand;
            set => SetAndRaise(RefreshCommandProperty, ref _refreshCommand, value);
        }

        static CameraFeedControl()
        {
            FrontEntranceImageProperty.Changed.AddClassHandler<CameraFeedControl>((x, e) => x.OnImageChanged());
            BackEntranceImageProperty.Changed.AddClassHandler<CameraFeedControl>((x, e) => x.OnImageChanged());
            FrontExitImageProperty.Changed.AddClassHandler<CameraFeedControl>((x, e) => x.OnImageChanged());
            BackExitImageProperty.Changed.AddClassHandler<CameraFeedControl>((x, e) => x.OnImageChanged());
            FooterButtonsProperty.Changed.AddClassHandler<CameraFeedControl>((x, e) => x.OnFooterButtonsChanged());
        }

        protected override void OnApplyTemplate(TemplateAppliedEventArgs e)
        {
            base.OnApplyTemplate(e);
            _isTemplateApplied = true;
            RefreshAll();
        }

        // Public method to refresh all camera feeds and UI
        public void RefreshAll()
        {
            if (!_isTemplateApplied) return;

            // Force update of all image bindings
            InvalidateVisual();

            // Trigger refresh command if available
            if (RefreshCommand?.CanExecute(null) == true)
            {
                RefreshCommand.Execute(null);
            }
        }

        // Public method to refresh specific camera
        public void RefreshCamera(string cameraPosition)
        {
            if (!_isTemplateApplied) return;

            // This could be extended to refresh specific cameras
            // For now, refresh all
            RefreshAll();
        }

        private void OnImageChanged()
        {
            if (_isTemplateApplied)
            {
                // Trigger UI update when any image changes
                InvalidateVisual();
            }
        }

        private void OnFooterButtonsChanged()
        {
            if (_isTemplateApplied)
            {
                // Refresh footer buttons
                InvalidateVisual();
            }
        }
    }
    public class CameraButton : ReactiveObject
    {
        private string _content = string.Empty;
        private string _tooltip = string.Empty;
        private string _background = "#333";
        private string _foreground = "White";
        private bool _isEnabled = true;
        private bool _isVisible = true;
        private int _columnIndex = 0;

        public string Content
        {
            get => _content;
            set => this.RaiseAndSetIfChanged(ref _content, value);
        }

        public string Tooltip
        {
            get => _tooltip;
            set => this.RaiseAndSetIfChanged(ref _tooltip, value);
        }

        public string Background
        {
            get => _background;
            set => this.RaiseAndSetIfChanged(ref _background, value);
        }

        public string Foreground
        {
            get => _foreground;
            set => this.RaiseAndSetIfChanged(ref _foreground, value);
        }

        public bool IsEnabled
        {
            get => _isEnabled;
            set => this.RaiseAndSetIfChanged(ref _isEnabled, value);
        }

        public bool IsVisible
        {
            get => _isVisible;
            set => this.RaiseAndSetIfChanged(ref _isVisible, value);
        }

        public int ColumnIndex
        {
            get => _columnIndex;
            set => this.RaiseAndSetIfChanged(ref _columnIndex, value);
        }

        public ICommand? Command { get; set; }
        public object? CommandParameter { get; set; }
    }
}
