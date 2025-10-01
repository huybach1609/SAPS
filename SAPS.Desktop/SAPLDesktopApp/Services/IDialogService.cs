using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    /// <summary>
    /// Service for showing dialogs and confirmations
    /// </summary>
    public interface IDialogService
    {
        /// <summary>
        /// Show a confirmation dialog with Yes/No buttons
        /// </summary>
        /// <param name="title">Dialog title</param>
        /// <param name="message">Dialog message</param>
        /// <param name="yesButtonText">Text for Yes button (optional)</param>
        /// <param name="noButtonText">Text for No button (optional)</param>
        /// <returns>True if user clicked Yes, False if user clicked No</returns>
        Task<bool> ShowConfirmationAsync(string title, string message, string? yesButtonText = null, string? noButtonText = null);

        /// <summary>
        /// Show an information dialog with OK button
        /// </summary>
        /// <param name="title">Dialog title</param>
        /// <param name="message">Dialog message</param>
        /// <param name="buttonText">Text for OK button (optional)</param>
        Task ShowInfoAsync(string title, string message, string? buttonText = null);

        /// <summary>
        /// Show an error dialog with OK button
        /// </summary>
        /// <param name="title">Dialog title</param>
        /// <param name="message">Dialog message</param>
        /// <param name="buttonText">Text for OK button (optional)</param>
        Task ShowErrorAsync(string title, string message, string? buttonText = null);
    }
}