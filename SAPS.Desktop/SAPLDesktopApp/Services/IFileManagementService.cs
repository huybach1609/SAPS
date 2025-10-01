using Avalonia.Media.Imaging;
using SAPLDesktopApp.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    public interface IFileManagementService : IDisposable
    {
        // Original file management methods
        Task<string> CopyToTempAsync(string originalFilePath, string originalFileName);
        Task<string> MoveToPermamentAsync(string tempFilePath, string incidentId);
        Task DeleteTempFileAsync(string tempFilePath);
        Task CleanupOldTempFilesAsync(TimeSpan maxAge);
        string GetTempFolderPath();
        string GetPermanentFolderPath();
        
        // Evidence file management methods
        bool DoesEvidenceFileExist(string incidentId, string fileName);
        string GetEvidenceFilePath(string incidentId, string fileName);
        Task<string> DownloadEvidenceFileAsync(string downloadUrl, string incidentId, string fileName);

        // Parking session file management methods
        bool DoesParkingSessionFileExist(string sessionId, string fileName);
        string GetParkingSessionFilePath(string sessionId, string fileName);
        Task<string> DownloadParkingSessionFileAsync(string downloadUrl, string sessionId, string fileName);
        Task<Bitmap?> LoadParkingSessionImageAsync(string sessionId, string fileName);
        string GetParkingSessionFolderPath(string sessionId);
        void EnsureParkingSessionFolderExists(string sessionId);

        // Bank list file management methods
        Task<string> GetBankListData();
        Task StoreBankList(string bankListContent);

        // Camera settings file management methods (moved from CameraSettingsService)
        Task<CameraAssignments> LoadCameraAssignmentsAsync();
        Task SaveCameraAssignmentsAsync(CameraAssignments assignments);

        // User settings file management methods (moved from SettingsService)
        UserSettings LoadUserSettings();
        Task SaveUserSettingsAsync(UserSettings settings);
        void EnsureUserSettingsDirectoryExists();
    }

    // Camera assignments model (moved from ICameraSettingsService)
    public class CameraAssignments
    {
        public int? FrontEntranceCameraIndex { get; set; }
        public int? BackEntranceCameraIndex { get; set; }
        public int? FrontExitCameraIndex { get; set; }
        public int? BackExitCameraIndex { get; set; }
    }
}
