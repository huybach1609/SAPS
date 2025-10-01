using System;
using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using Avalonia.Media.Imaging;
using SAPLDesktopApp.Models;
using System.Text.Json;

namespace SAPLDesktopApp.Services
{
    public sealed class FileManagementService : IFileManagementService
    {
        private readonly string _tempFolderPath;
        private readonly string _incidentReportsFolderPath;
        private readonly string _parkingSessionsFolderPath;
        private readonly string _bankListFilePath;
        private readonly string _cameraSettingsFilePath;
        private readonly string _userSettingsFilePath;
        private readonly string _appDataPath;
        private readonly HttpClient _httpClient;

        public FileManagementService()
        {
            _appDataPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "SAPL");
            _tempFolderPath = Path.Combine(_appDataPath, "TempFiles");
            _incidentReportsFolderPath = Path.Combine(_appDataPath, "IncidentFiles");
            _parkingSessionsFolderPath = Path.Combine(_appDataPath, "ParkingSessions");
            _bankListFilePath = Path.Combine(_appDataPath, "banklist.json");
            _cameraSettingsFilePath = Path.Combine(_appDataPath, "camera_settings.json");
            _userSettingsFilePath = Path.Combine(_appDataPath, "settings.json");
            _httpClient = new HttpClient();

            // Ensure directories exist
            EnsureDirectoriesExist();
        }

        private void EnsureDirectoriesExist()
        {
            try
            {
                if (!Directory.Exists(_appDataPath))
                    Directory.CreateDirectory(_appDataPath);

                if (!Directory.Exists(_tempFolderPath))
                    Directory.CreateDirectory(_tempFolderPath);

                if (!Directory.Exists(_incidentReportsFolderPath))
                    Directory.CreateDirectory(_incidentReportsFolderPath);

                if (!Directory.Exists(_parkingSessionsFolderPath))
                    Directory.CreateDirectory(_parkingSessionsFolderPath);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"FileManagementService: Error creating directories: {ex.Message}");
            }
        }

        #region Original File Management Methods

        public async Task<string> CopyToTempAsync(string originalFilePath, string originalFileName)
        {
            try
            {
                if (!File.Exists(originalFilePath))
                    throw new FileNotFoundException($"Original file not found: {originalFilePath}");

                // Generate unique filename to avoid conflicts
                var uniqueFileName = $"{Guid.NewGuid()}_{originalFileName}";
                var tempFilePath = Path.Combine(_tempFolderPath, uniqueFileName);

                // Copy file to temp folder
                await Task.Run(() => File.Copy(originalFilePath, tempFilePath, true));

                System.Diagnostics.Debug.WriteLine($"FileManagementService: File copied to temp - {tempFilePath}");
                return tempFilePath;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"FileManagementService: Error copying to temp: {ex.Message}");
                throw;
            }
        }

        public async Task<string> MoveToPermamentAsync(string tempFilePath, string incidentId)
        {
            try
            {
                if (!File.Exists(tempFilePath))
                    throw new FileNotFoundException($"Temp file not found: {tempFilePath}");

                // Create incident-specific folder
                var incidentFolderPath = Path.Combine(_incidentReportsFolderPath, incidentId);
                if (!Directory.Exists(incidentFolderPath))
                    Directory.CreateDirectory(incidentFolderPath);

                // Get original filename from temp file (remove GUID prefix)
                var tempFileName = Path.GetFileName(tempFilePath);
                var originalFileName = tempFileName.Substring(37); // Remove GUID (36 chars) + underscore

                var permanentFilePath = Path.Combine(incidentFolderPath, originalFileName);

                // Move file from temp to permanent folder
                await Task.Run(() =>
                {
                    File.Move(tempFilePath, permanentFilePath, true);
                });

                System.Diagnostics.Debug.WriteLine($"FileManagementService: File moved to permanent - {permanentFilePath}");
                return permanentFilePath;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"FileManagementService: Error moving to permanent: {ex.Message}");
                throw;
            }
        }

        public async Task DeleteTempFileAsync(string tempFilePath)
        {
            try
            {
                if (File.Exists(tempFilePath))
                {
                    await Task.Run(() => File.Delete(tempFilePath));
                    System.Diagnostics.Debug.WriteLine($"FileManagementService: Temp file deleted - {tempFilePath}");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"FileManagementService: Error deleting temp file: {ex.Message}");
            }
        }

        public async Task CleanupOldTempFilesAsync(TimeSpan maxAge)
        {
            try
            {
                var cutoffTime = DateTime.Now - maxAge;
                var tempFiles = Directory.GetFiles(_tempFolderPath);

                var deletedCount = 0;
                foreach (var file in tempFiles)
                {
                    var fileInfo = new FileInfo(file);
                    if (fileInfo.CreationTime < cutoffTime)
                    {
                        await DeleteTempFileAsync(file);
                        deletedCount++;
                    }
                }

                if (deletedCount > 0)
                {
                    System.Diagnostics.Debug.WriteLine($"FileManagementService: Cleaned up {deletedCount} old temp files");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"FileManagementService: Error during cleanup: {ex.Message}");
            }
        }

        public string GetTempFolderPath() => _tempFolderPath;
        public string GetPermanentFolderPath() => _incidentReportsFolderPath;

        #endregion

        #region Evidence File Management Methods

        public bool DoesEvidenceFileExist(string incidentId, string fileName)
        {
            try
            {
                var filePath = GetEvidenceFilePath(incidentId, fileName);
                return File.Exists(filePath);
            }
            catch
            {
                return false;
            }
        }

        public string GetEvidenceFilePath(string incidentId, string fileName)
        {
            var incidentFolderPath = Path.Combine(_incidentReportsFolderPath, incidentId);
            return Path.Combine(incidentFolderPath, fileName);
        }

        public async Task<string> DownloadEvidenceFileAsync(string downloadUrl, string incidentId, string fileName)
        {
            try
            {
                // Create incident-specific folder if it doesn't exist
                var incidentFolderPath = Path.Combine(_incidentReportsFolderPath, incidentId);
                if (!Directory.Exists(incidentFolderPath))
                    Directory.CreateDirectory(incidentFolderPath);

                var filePath = Path.Combine(incidentFolderPath, fileName);

                // Download the file
                using var response = await _httpClient.GetAsync(downloadUrl);
                response.EnsureSuccessStatusCode();

                await using var fileStream = File.Create(filePath);
                await using var downloadStream = await response.Content.ReadAsStreamAsync();
                await downloadStream.CopyToAsync(fileStream);

                System.Diagnostics.Debug.WriteLine($"FileManagementService: Evidence file downloaded - {filePath}");
                return filePath;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"FileManagementService: Error downloading evidence file: {ex.Message}");
                throw;
            }
        }

        #endregion

        #region Parking Session File Management Methods

        public bool DoesParkingSessionFileExist(string sessionId, string fileName)
        {
            try
            {
                var filePath = GetParkingSessionFilePath(sessionId, fileName);
                return File.Exists(filePath);
            }
            catch
            {
                return false;
            }
        }

        public string GetParkingSessionFilePath(string sessionId, string fileName)
        {
            var sessionFolderPath = GetParkingSessionFolderPath(sessionId);
            return Path.Combine(sessionFolderPath, fileName);
        }

        public async Task<string> DownloadParkingSessionFileAsync(string downloadUrl, string sessionId, string fileName)
        {
            try
            {
                // Ensure session folder exists
                EnsureParkingSessionFolderExists(sessionId);

                var filePath = GetParkingSessionFilePath(sessionId, fileName);

                // Download the file
                using var response = await _httpClient.GetAsync(downloadUrl);
                response.EnsureSuccessStatusCode();

                await using var fileStream = File.Create(filePath);
                await using var downloadStream = await response.Content.ReadAsStreamAsync();
                await downloadStream.CopyToAsync(fileStream);

                System.Diagnostics.Debug.WriteLine($"FileManagementService: Parking session file downloaded - {filePath}");
                return filePath;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"FileManagementService: Error downloading parking session file: {ex.Message}");
                throw;
            }
        }

        public async Task<Bitmap?> LoadParkingSessionImageAsync(string sessionId, string fileName)
        {
            try
            {
                var filePath = GetParkingSessionFilePath(sessionId, fileName);
                
                if (!File.Exists(filePath))
                    return null;

                await using var stream = File.OpenRead(filePath);
                return new Bitmap(stream);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"FileManagementService: Error loading parking session image: {ex.Message}");
                return null;
            }
        }

        public string GetParkingSessionFolderPath(string sessionId)
        {
            return Path.Combine(_parkingSessionsFolderPath, sessionId);
        }

        public void EnsureParkingSessionFolderExists(string sessionId)
        {
            try
            {
                var sessionFolderPath = GetParkingSessionFolderPath(sessionId);
                if (!Directory.Exists(sessionFolderPath))
                    Directory.CreateDirectory(sessionFolderPath);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"FileManagementService: Error creating parking session folder: {ex.Message}");
                throw;
            }
        }

        #endregion

        #region Bank List File Management Methods

        public async Task<string> GetBankListData()
        {
            if (!File.Exists(_bankListFilePath))
                return string.Empty;
            try
            {
                return await File.ReadAllTextAsync(_bankListFilePath);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"FileManagementService: Error reading bank list file: {ex.Message}");
                return string.Empty;
            }
        }

        public async Task StoreBankList(string bankListContent)
        {
            try
            {
                await File.WriteAllTextAsync(_bankListFilePath, bankListContent);
                System.Diagnostics.Debug.WriteLine("FileManagementService: Bank list stored successfully");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"FileManagementService: Error storing bank list: {ex.Message}");
                throw;
            }
        }

        #endregion

        #region Camera Settings File Management Methods (moved from CameraSettingsService)

        public async Task<CameraAssignments> LoadCameraAssignmentsAsync()
        {
            try
            {
                if (!File.Exists(_cameraSettingsFilePath))
                    return new CameraAssignments();

                var json = await File.ReadAllTextAsync(_cameraSettingsFilePath);
                return JsonSerializer.Deserialize<CameraAssignments>(json) ?? new CameraAssignments();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"FileManagementService: Error loading camera assignments: {ex.Message}");
                return new CameraAssignments();
            }
        }

        public async Task SaveCameraAssignmentsAsync(CameraAssignments assignments)
        {
            try
            {
                var directory = Path.GetDirectoryName(_cameraSettingsFilePath);
                if (directory != null && !Directory.Exists(directory))
                    Directory.CreateDirectory(directory);

                var json = JsonSerializer.Serialize(assignments, new JsonSerializerOptions { WriteIndented = true });
                await File.WriteAllTextAsync(_cameraSettingsFilePath, json);

                System.Diagnostics.Debug.WriteLine("FileManagementService: Camera assignments saved successfully");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"FileManagementService: Error saving camera assignments: {ex.Message}");
                throw;
            }
        }

        #endregion

        #region User Settings File Management Methods (moved from SettingsService)

        public UserSettings LoadUserSettings()
        {
            try
            {
                if (!File.Exists(_userSettingsFilePath))
                {
                    // Return default settings with Vietnamese as default language
                    return new UserSettings 
                    { 
                        LanguageCode = Constants.LanguageConstants.VIETNAMESE_CODE 
                    };
                }

                var json = File.ReadAllText(_userSettingsFilePath);
                var settings = JsonSerializer.Deserialize<UserSettings>(json);
                return settings ?? new UserSettings 
                { 
                    LanguageCode = Constants.LanguageConstants.VIETNAMESE_CODE 
                };
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"FileManagementService: Error loading user settings: {ex.Message}");
                return new UserSettings 
                { 
                    LanguageCode = Constants.LanguageConstants.VIETNAMESE_CODE 
                };
            }
        }

        public async Task SaveUserSettingsAsync(UserSettings settings)
        {
            try
            {
                EnsureUserSettingsDirectoryExists();

                var json = JsonSerializer.Serialize(settings, new JsonSerializerOptions { WriteIndented = true });
                await File.WriteAllTextAsync(_userSettingsFilePath, json);

                System.Diagnostics.Debug.WriteLine("FileManagementService: User settings saved successfully");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"FileManagementService: Error saving user settings: {ex.Message}");
                throw;
            }
        }

        public void EnsureUserSettingsDirectoryExists()
        {
            try
            {
                var directory = Path.GetDirectoryName(_userSettingsFilePath);
                if (directory != null && !Directory.Exists(directory))
                    Directory.CreateDirectory(directory);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"FileManagementService: Error creating user settings directory: {ex.Message}");
                throw;
            }
        }

        #endregion

        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }
}