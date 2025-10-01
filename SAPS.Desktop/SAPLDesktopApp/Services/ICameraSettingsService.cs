using System;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    public interface ICameraSettingsService
    {
        Task<CameraAssignments> LoadCameraAssignmentsAsync();
        Task SaveCameraAssignmentsAsync(CameraAssignments assignments);
        
        // Event to notify when camera assignments change
        event Action<CameraAssignments>? CameraAssignmentsChanged;
    }
}