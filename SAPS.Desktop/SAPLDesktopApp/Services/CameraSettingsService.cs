using System;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    public class CameraSettingsService : ICameraSettingsService
    {
        private readonly IFileManagementService _fileManagementService;

        public event Action<CameraAssignments>? CameraAssignmentsChanged;

        public CameraSettingsService(IFileManagementService fileManagementService)
        {
            _fileManagementService = fileManagementService ?? throw new ArgumentNullException(nameof(fileManagementService));
        }

        public async Task<CameraAssignments> LoadCameraAssignmentsAsync()
        {
            try
            {
                return await _fileManagementService.LoadCameraAssignmentsAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"CameraSettingsService: Error loading camera assignments: {ex.Message}");
                return new CameraAssignments();
            }
        }

        public async Task SaveCameraAssignmentsAsync(CameraAssignments assignments)
        {
            try
            {
                await _fileManagementService.SaveCameraAssignmentsAsync(assignments);

                // Notify that camera assignments have changed
                CameraAssignmentsChanged?.Invoke(assignments);
                
                System.Diagnostics.Debug.WriteLine("CameraSettingsService: Camera assignments saved and change event fired");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"CameraSettingsService: Error saving camera settings: {ex.Message}");
                throw;
            }
        }
    }
}