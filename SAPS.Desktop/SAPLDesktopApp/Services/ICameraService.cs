using Avalonia.Media.Imaging;
using SAPLDesktopApp.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    /// <summary>
    /// Interface for managing multiple cameras using OpenCVSharp
    /// </summary>
    public interface ICameraService : IDisposable
    {
        /// <summary>
        /// Event fired when a new frame is received from a camera
        /// </summary>
        event Action<int, Bitmap?>? NewFrameReceived;

        /// <summary>
        /// Event fired when a license plate is detected
        /// </summary>
        event Action<int, string, float>? LicensePlateDetected;

        /// <summary>
        /// Get a list of all available camera devices on the system
        /// </summary>
        /// <returns>List of camera device information</returns>
        Task<List<CameraDeviceInfo>> GetAvailableCameras();

        /// <summary>
        /// Initialize a camera with the specified device index
        /// </summary>
        /// <param name="deviceIndex">Camera device index</param>
        /// <returns>True if initialization was successful, false otherwise</returns>
        bool Initialize(int deviceIndex);

        /// <summary>
        /// Start capturing frames from the specified camera
        /// </summary>
        /// <param name="deviceIndex">Camera device index</param>
        /// <returns>True if the camera started successfully, false otherwise</returns>
        bool Start(int deviceIndex);

        /// <summary>
        /// Stop capturing frames from the specified camera
        /// </summary>
        /// <param name="deviceIndex">Camera device index</param>
        void Stop(int deviceIndex);

        /// <summary>
        /// Capture a single frame from the specified camera
        /// </summary>
        /// <param name="deviceIndex">Camera device index</param>
        /// <returns>Captured frame as Bitmap, or null if capture failed</returns>
        Task<Bitmap?> CaptureFrameAsync(int deviceIndex);

        /// <summary>
        /// Check if the specified camera is currently running
        /// </summary>
        /// <param name="deviceIndex">Camera device index</param>
        /// <returns>True if the camera is running, false otherwise</returns>
        bool IsRunning(int deviceIndex);

        /// <summary>
        /// Stop and release all active cameras
        /// </summary>
        void ReleaseAllCameras();

        /// <summary>
        /// Set the license plate recognition interval for a camera
        /// </summary>
        /// <param name="deviceIndex">Camera device index</param>
        /// <param name="intervalMs">Interval in milliseconds</param>
        void SetLicensePlateRecognitionInterval(int deviceIndex, int intervalMs);

        bool IsDetectingEntrance();

        bool IsDetectingExit();

        void SetIsDetectingEntrance(bool status);

        void SetIsDetectingExit(bool status);
    }
}