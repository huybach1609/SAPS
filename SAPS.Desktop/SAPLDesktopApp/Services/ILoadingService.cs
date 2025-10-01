using System;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    /// <summary>
    /// Service for managing loading overlays using PopupHost
    /// </summary>
    public interface ILoadingService
    {
        /// <summary>
        /// Show a loading overlay with indeterminate progress
        /// </summary>
        /// <param name="message">Loading message</param>
        /// <param name="description">Optional description</param>
        Task ShowLoading(string message = "Loading...", string description = "");

        /// <summary>
        /// Show a loading overlay with determinate progress
        /// </summary>
        /// <param name="message">Loading message</param>
        /// <param name="description">Optional description</param>
        Task ShowProgressLoading(string message = "Loading...", string description = "");

        /// <summary>
        /// Update the loading message and description
        /// </summary>
        /// <param name="message">New message</param>
        /// <param name="description">New description</param>
        void UpdateLoadingStatus(string message, string description = "");

        /// <summary>
        /// Update progress (switches to determinate mode)
        /// </summary>
        /// <param name="progress">Progress value (0-100)</param>
        /// <param name="message">Optional message update</param>
        void UpdateProgress(double progress, string? message = null);

        /// <summary>
        /// Hide the loading overlay
        /// </summary>
        Task HideLoading();

        /// <summary>
        /// Execute an action with loading overlay
        /// </summary>
        /// <param name="action">Action to execute</param>
        /// <param name="message">Loading message</param>
        /// <param name="description">Optional description</param>
        Task ExecuteWithLoadingAsync(Func<Task> action, string message = "Loading...", string description = "");

        /// <summary>
        /// Execute an action with loading overlay and return result
        /// </summary>
        /// <typeparam name="T">Return type</typeparam>
        /// <param name="action">Action to execute</param>
        /// <param name="message">Loading message</param>
        /// <param name="description">Optional description</param>
        /// <returns>Action result</returns>
        Task<T> ExecuteWithLoadingAsync<T>(Func<Task<T>> action, string message = "Loading...", string description = "");

        /// <summary>
        /// Whether a loading overlay is currently shown
        /// </summary>
        bool IsLoadingVisible { get; }
    }
}