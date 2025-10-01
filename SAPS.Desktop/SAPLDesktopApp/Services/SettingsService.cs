using SAPLDesktopApp.Constants;
using SAPLDesktopApp.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    public class SettingsService : ISettingsService
    {
        private readonly IFileManagementService _fileManagementService;
        private readonly IDialogService _dialogService;
        private UserSettings _currentSettings;

        public SettingsService(IFileManagementService fileManagementService)
        {
            _fileManagementService = fileManagementService ?? throw new ArgumentNullException(nameof(fileManagementService));
            _dialogService = ServiceLocator.GetService<IDialogService>();
            _currentSettings = new UserSettings();
        }

        public void Initialize()
        {
            LoadSettings();
        }

        public async Task<UserSettings> GetUserSettingsAsync()
        {
            return await Task.FromResult(_currentSettings);
        }

        private async Task SaveUserSettingsAsync(UserSettings settings)
        {
            try
            {
                _currentSettings = settings;
                await _fileManagementService.SaveUserSettingsAsync(settings);
                LoadSettings();
                System.Diagnostics.Debug.WriteLine("SettingsService: User settings saved successfully");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"SettingsService: Error saving settings: {ex.Message}");
                throw;
            }
        }

        public async Task<List<LanguageOption>> GetAvailableLanguagesAsync()
        {
            return await Task.FromResult(new List<LanguageOption>
            {
                new LanguageOption
                {
                    Code = LanguageConstants.ENGLISH_CODE,
                    Name = Resources.TextResource.LanguageEnglish,
                    NativeName = Resources.TextResource.LanguageEnglishNative,
                    IsSelected = _currentSettings.LanguageCode == LanguageConstants.ENGLISH_CODE
                },
                new LanguageOption
                {
                    Code = LanguageConstants.VIETNAMESE_CODE,
                    Name = Resources.TextResource.LanguageVietnamese,
                    NativeName = Resources.TextResource.LanguageVietnameseNative,
                    IsSelected = _currentSettings.LanguageCode == LanguageConstants.VIETNAMESE_CODE
                }
            });
        }

        public async Task ChangeLanguageAsync(string languageCode)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(languageCode))
                {
                    System.Diagnostics.Debug.WriteLine("SettingsService: Invalid language code provided");
                    return;
                }

                _currentSettings.LanguageCode = languageCode;
                await SaveUserSettingsAsync(_currentSettings);
                ApplyCultureChange(languageCode);

                System.Diagnostics.Debug.WriteLine($"SettingsService: Language changed to: {languageCode}");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"SettingsService: Error changing language: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> ChangeLanguageWithConfirmationAsync(string languageCode)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(languageCode))
                {
                    System.Diagnostics.Debug.WriteLine("SettingsService: Invalid language code provided");
                    return false;
                }

                if (_currentSettings.LanguageCode == languageCode)
                {
                    return false;
                }

                var languageName = languageCode switch
                {
                    LanguageConstants.ENGLISH_CODE => Resources.TextResource.LanguageEnglish,
                    LanguageConstants.VIETNAMESE_CODE => Resources.TextResource.LanguageVietnamese,
                    _ => Resources.TextResource.LanguageEnglish
                };

                var confirmed = await _dialogService.ShowConfirmationAsync(
                    Resources.TextResource.LanguageChangeTitle,
                    string.Format(Resources.TextResource.LanguageChangeConfirmMessage, languageName),
                    Resources.TextResource.BtnRestart,
                    Resources.TextResource.BtnCancel
                );

                if (!confirmed)
                {
                    return false;
                }

                _currentSettings.LanguageCode = languageCode;
                await SaveUserSettingsAsync(_currentSettings);

                System.Diagnostics.Debug.WriteLine($"SettingsService: Language will change to: {languageCode} after restart");
                return true;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"SettingsService: Error changing language: {ex.Message}");
                throw;
            }
        }

        public string GetCurrentLanguageDisplayName()
        {
            return _currentSettings.LanguageCode switch
            {
                LanguageConstants.ENGLISH_CODE => Resources.TextResource.LanguageEnglish,
                LanguageConstants.VIETNAMESE_CODE => Resources.TextResource.LanguageVietnamese,
                _ => Resources.TextResource.LanguageEnglish
            };
        }

        private static void ApplyCultureChange(string languageCode)
        {
            try
            {
                var culture = new CultureInfo(languageCode);
                Resources.TextResource.Culture = culture;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"SettingsService: Error applying culture change: {ex.Message}");
                throw;
            }
        }

        private void LoadSettings()
        {
            try
            {
                _currentSettings = _fileManagementService.LoadUserSettings();
                ApplyCultureChange(_currentSettings.LanguageCode);
                System.Diagnostics.Debug.WriteLine($"SettingsService: Settings loaded, language: {_currentSettings.LanguageCode}");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"SettingsService: Error loading settings: {ex.Message}");
                _currentSettings = new UserSettings { LanguageCode = LanguageConstants.VIETNAMESE_CODE };
                ApplyCultureChange(LanguageConstants.VIETNAMESE_CODE);
            }
        }
    }
}