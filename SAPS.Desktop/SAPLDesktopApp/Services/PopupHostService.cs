using Avalonia.Controls;
using Avalonia.Controls.Presenters;
using Avalonia.Layout;
using Avalonia.Media;
using Avalonia.Threading;
using System;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    public class PopupHostService : IPopupHostService
    {
        private Grid? _popupHost;
        private Border? _overlay;
        private ContentPresenter? _contentPresenter;

        public bool IsPopupVisible => _popupHost?.IsVisible == true;

        public void Initialize(Grid popupHost)
        {
            _popupHost = popupHost ?? throw new ArgumentNullException(nameof(popupHost));
            System.Diagnostics.Debug.WriteLine("PopupHostService: Initialized with popup host");
        }

        public async Task ShowPopupAsync(Control content, bool showOverlay = true)
        {
            if (_popupHost == null)
            {
                throw new InvalidOperationException("PopupHost must be initialized before use");
            }

            await Dispatcher.UIThread.InvokeAsync(() =>
            {
                try
                {
                    // Clear existing content
                    _popupHost.Children.Clear();

                    if (showOverlay)
                    {
                        // Create overlay
                        _overlay = new Border
                        {
                            Classes = { "popup-overlay" },
                            HorizontalAlignment = HorizontalAlignment.Stretch,
                            VerticalAlignment = VerticalAlignment.Stretch
                        };
                        _popupHost.Children.Add(_overlay);
                    }

                    // Create content presenter
                    _contentPresenter = new ContentPresenter
                    {
                        Content = content,
                        HorizontalAlignment = HorizontalAlignment.Center,
                        VerticalAlignment = VerticalAlignment.Center,
                        ZIndex = 10001
                    };
                    _popupHost.Children.Add(_contentPresenter);

                    // Show the popup host
                    _popupHost.IsVisible = true;

                    System.Diagnostics.Debug.WriteLine("PopupHostService: Popup shown successfully");
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"PopupHostService: Error showing popup - {ex.Message}");
                }
            });
        }

        public async Task HidePopupAsync()
        {
            if (_popupHost == null) return;

            await Dispatcher.UIThread.InvokeAsync(() =>
            {
                try
                {
                    // Hide the popup host
                    _popupHost.IsVisible = false;

                    // Clear content
                    _popupHost.Children.Clear();
                    _overlay = null;
                    _contentPresenter = null;

                    System.Diagnostics.Debug.WriteLine("PopupHostService: Popup hidden successfully");
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"PopupHostService: Error hiding popup - {ex.Message}");
                }
            });
        }
    }
}