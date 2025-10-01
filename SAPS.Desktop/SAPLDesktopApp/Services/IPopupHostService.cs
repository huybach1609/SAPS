using Avalonia.Controls;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    /// <summary>
    /// Service for managing popup host in MainWindow
    /// </summary>
    public interface IPopupHostService
    {
        /// <summary>
        /// Show content in the popup host
        /// </summary>
        /// <param name="content">Content to show</param>
        /// <param name="showOverlay">Whether to show semi-transparent overlay</param>
        Task ShowPopupAsync(Control content, bool showOverlay = true);

        /// <summary>
        /// Hide the popup host and clear content
        /// </summary>
        Task HidePopupAsync();

        /// <summary>
        /// Whether a popup is currently visible
        /// </summary>
        bool IsPopupVisible { get; }

        /// <summary>
        /// Initialize the popup host with the main window's popup container
        /// </summary>
        /// <param name="popupHost">The popup host grid from MainWindow</param>
        void Initialize(Grid popupHost);
    }
}