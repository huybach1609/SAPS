using System;
using System.Threading.Tasks;
using SAPLDesktopApp.Controls;

namespace SAPLDesktopApp.Services
{
    public class LoadingService : ILoadingService
    {
        private readonly IPopupHostService _popupHostService;
        private LoadingPopup? _loadingPopup;

        public LoadingService(IPopupHostService popupHostService)
        {
            _popupHostService = popupHostService ?? throw new ArgumentNullException(nameof(popupHostService));
        }

        public bool IsLoadingVisible => _popupHostService.IsPopupVisible;

        public async Task ShowLoading(string message = "Loading...", string description = "")
        {
            try
            {
                _loadingPopup = new LoadingPopup();
                _loadingPopup.UpdateStatus(message, description);
                _loadingPopup.IsIndeterminate = true;

                await _popupHostService.ShowPopupAsync(_loadingPopup, showOverlay: true);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"LoadingService: Error showing loading - {ex.Message}");
            }
        }

        public async Task ShowProgressLoading(string message = "Loading...", string description = "")
        {
            try
            {
                // Single responsibility: Create and show progress loading
                _loadingPopup = new LoadingPopup();
                _loadingPopup.UpdateStatus(message, description);
                _loadingPopup.IsIndeterminate = false;
                _loadingPopup.Progress = 0;

                await _popupHostService.ShowPopupAsync(_loadingPopup, showOverlay: true);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"LoadingService: Error showing progress loading - {ex.Message}");
            }
        }

        public void UpdateLoadingStatus(string message, string description = "")
        {
            // Single responsibility: Update loading status
            _loadingPopup?.UpdateStatus(message, description);
        }

        public void UpdateProgress(double progress, string? message = null)
        {
            // Single responsibility: Update progress
            _loadingPopup?.UpdateProgress(progress, message);
        }

        public async Task HideLoading()
        {
            try
            {
                // Single responsibility: Hide loading
                await _popupHostService.HidePopupAsync();
                _loadingPopup = null;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"LoadingService: Error hiding loading - {ex.Message}");
            }
        }

        public async Task ExecuteWithLoadingAsync(Func<Task> action, string message = "Loading...", string description = "")
        {
            await ShowLoading(message, description);
            try
            {
                await action();
            }
            finally
            {
                await HideLoading();
            }
        }

        public async Task<T> ExecuteWithLoadingAsync<T>(Func<Task<T>> action, string message = "Loading...", string description = "")
        {
            // Coordinate hiding and showing
            await HideLoading();
            await ShowLoading(message, description);
            try
            {
                return await action();
            }
            finally
            {
                await HideLoading();
            }
        }
    }
}