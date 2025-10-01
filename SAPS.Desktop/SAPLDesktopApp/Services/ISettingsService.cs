using SAPLDesktopApp.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    /// <summary>
    /// Service for managing application settings
    /// </summary>
    public interface ISettingsService
    {
        /// <summary>
        /// Initialize settings - should be called at app startup
        /// </summary>
        void Initialize();

        /// <summary>
        /// Get current user settings
        /// </summary>
        /// <returns>Current user settings</returns>
        Task<UserSettings> GetUserSettingsAsync();

        Task<List<LanguageOption>> GetAvailableLanguagesAsync();

        /// <summary>
        /// Change application language and refresh UI
        /// </summary>
        /// <param name="languageCode">Language code (e.g., "en", "vi", "en-US", "vi-VN")</param>
        Task ChangeLanguageAsync(string languageCode);

        /// <summary>
        /// Change application language with confirmation dialog for restart
        /// </summary>
        /// <param name="languageCode">Language code (e.g., "en", "vi", "en-US", "vi-VN")</param>
        /// <returns>True if language was changed and app should restart, False if user cancelled</returns>
        Task<bool> ChangeLanguageWithConfirmationAsync(string languageCode);

        /// <summary>
        /// Get the current language display name
        /// </summary>
        /// <returns>Display name of current language</returns>
        string GetCurrentLanguageDisplayName();
    }
}