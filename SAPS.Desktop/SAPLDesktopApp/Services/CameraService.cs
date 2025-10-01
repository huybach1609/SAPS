using Avalonia.Media.Imaging;
using DirectShowLib;
using OpenCvSharp;
using SAPLDesktopApp.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    public sealed class CameraService : ICameraService
    {
        private readonly Dictionary<int, VideoCapture> _captures = new();
        private readonly Dictionary<int, int> _licensePlateRecognitionIntervals;
        private readonly Dictionary<int, DateTime> _lastLicensePlateRecognition;
        private readonly object _captureLock = new();
        private readonly ILicensePlateRecognitionService _licensePlateService;
        private readonly INotificationService _notificationService;
        private bool _isDetectingEntrance = false;
        private bool _isDetectingExit = false;

        public event Action<int, Bitmap?>? NewFrameReceived;
        public event Action<int, string, float>? LicensePlateDetected;

        public CameraService(ILicensePlateRecognitionService licensePlateService, INotificationService notificationService)
        {
            _licensePlateService = licensePlateService ?? throw new ArgumentNullException(nameof(licensePlateService));
            _notificationService = notificationService ?? throw new ArgumentNullException(nameof(notificationService));
            _licensePlateRecognitionIntervals = new Dictionary<int, int>();
            _lastLicensePlateRecognition = new Dictionary<int, DateTime>();
        }

        public async Task<List<CameraDeviceInfo>> GetAvailableCameras()
        {
            return await Task.Run(() =>
            {
                try
                {
                    var videoInputDevices = DsDevice.GetDevicesOfCat(FilterCategory.VideoInputDevice);
                    int openCvIndex = 0;
                    return videoInputDevices.Select(device => new CameraDeviceInfo
                    {
                        Index = openCvIndex++,
                        Name = device.Name,
                        DeviceId = device.ClassID.ToString(),
                        Manufacturer = device.DevicePath,
                        Description = device.Name
                    }).ToList();
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error getting camera names: {ex.Message}");
                    return new List<CameraDeviceInfo>();
                }
            });
        }

        public bool Initialize(int deviceIndex)
        {
            try
            {
                lock (_captureLock)
                {
                    if (_captures.ContainsKey(deviceIndex))
                        return true;

                    var capture = new VideoCapture(deviceIndex, VideoCaptureAPIs.MSMF);
                    if (!capture.IsOpened())
                    {
                        System.Diagnostics.Debug.WriteLine($"Camera {deviceIndex}: Failed to open");
                        return false;
                    }

                    capture.Set(VideoCaptureProperties.FrameWidth, 640);
                    capture.Set(VideoCaptureProperties.FrameHeight, 480);
                    capture.Set(VideoCaptureProperties.Fps, 60);
                    capture.Set(VideoCaptureProperties.BufferSize, 1);

                    _captures[deviceIndex] = capture;
                    _licensePlateRecognitionIntervals[deviceIndex] = 3000; // Default 3 seconds
                    _lastLicensePlateRecognition[deviceIndex] = DateTime.MinValue;

                    _isDetectingEntrance = true;
                    _isDetectingExit = true;
                    System.Diagnostics.Debug.WriteLine($"Camera {deviceIndex}: Initialized successfully with license plate recognition enabled");
                    return true;
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Camera {deviceIndex}: Initialize error - {ex.Message}");
                return false;
            }
        }

        public bool Start(int deviceIndex)
        {
            try
            {
                if (!_captures.ContainsKey(deviceIndex))
                    return false;

                Task.Run(() => CaptureLoop(deviceIndex));
                System.Diagnostics.Debug.WriteLine($"Camera {deviceIndex}: Started successfully");
                return true;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Camera {deviceIndex}: Start error - {ex.Message}");
                return false;
            }
        }

        public void Stop(int deviceIndex)
        {
            try
            {
                if (_captures.TryGetValue(deviceIndex, out var capture))
                {
                    capture.Release();
                    capture.Dispose();
                    _captures.Remove(deviceIndex);
                }

                // Clean up license plate recognition settings
                _licensePlateRecognitionIntervals.Remove(deviceIndex);
                _lastLicensePlateRecognition.Remove(deviceIndex);

                System.Diagnostics.Debug.WriteLine($"Camera {deviceIndex}: Stopped successfully");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Camera {deviceIndex}: Stop error - {ex.Message}");
            }
        }

        public async Task<Bitmap?> CaptureFrameAsync(int deviceIndex)
        {
            return await Task.Run(() =>
            {
                try
                {
                    if (!_captures.ContainsKey(deviceIndex))
                        return null;

                    lock (_captureLock)
                    {
                        using var frame = new Mat();
                        if (!_captures[deviceIndex].Read(frame) || frame.Empty())
                            return null;

                        return ConvertMatToBitmap(frame);
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Camera {deviceIndex}: Capture frame error - {ex.Message}");
                    return null;
                }
            });
        }

        public bool IsRunning(int deviceIndex)
        {
            return _captures.ContainsKey(deviceIndex);
        }

        public void ReleaseAllCameras()
        {
            foreach (var deviceIndex in _captures.Keys.ToList())
            {
                Stop(deviceIndex);
            }
        }

        public void SetLicensePlateRecognitionInterval(int deviceIndex, int intervalMs)
        {
            if (_licensePlateRecognitionIntervals.ContainsKey(deviceIndex))
            {
                _licensePlateRecognitionIntervals[deviceIndex] = Math.Max(1000, intervalMs); // Minimum 1 second
                System.Diagnostics.Debug.WriteLine($"Camera {deviceIndex}: License plate recognition interval set to {intervalMs}ms");
            }
        }

        private void CaptureLoop(int deviceIndex)
        {
            using var frame = new Mat();

            while (_captures.ContainsKey(deviceIndex))
            {
                try
                {
                    lock (_captureLock)
                    {
                        if (!_captures[deviceIndex].Read(frame) || frame.Empty())
                        {
                            Thread.Sleep(50);
                            continue;
                        }

                        var bitmap = ConvertMatToBitmap(frame);
                        if (bitmap != null)
                        {
                            // Send frame to UI
                            Avalonia.Threading.Dispatcher.UIThread.InvokeAsync(() =>
                            {
                                NewFrameReceived?.Invoke(deviceIndex, bitmap);
                            });

                            // Process license plate recognition (always enabled)
                            _ = Task.Run(async () => await ProcessLicensePlateRecognitionAsync(deviceIndex, bitmap));
                        }
                    }

                    Thread.Sleep(67); // ~15 FPS
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Camera {deviceIndex}: Capture loop error - {ex.Message}");
                    Thread.Sleep(500);
                }
            }
        }

        private async Task ProcessLicensePlateRecognitionAsync(int deviceIndex, Bitmap bitmap)
        {
            try
            {
                // Check if enough time has passed since last recognition
                var now = DateTime.Now;
                if (_lastLicensePlateRecognition.TryGetValue(deviceIndex, out var lastRecognition))
                {
                    var interval = _licensePlateRecognitionIntervals.TryGetValue(deviceIndex, out var intervalMs) ? intervalMs : 3000;
                    if ((now - lastRecognition).TotalMilliseconds < interval)
                        return;
                }

                _lastLicensePlateRecognition[deviceIndex] = now;

                // Process the image for license plates
                var licensePlates = await _licensePlateService.ProcessImageAsync(bitmap);

                foreach (var licensePlate in licensePlates)
                {
                    if (!string.IsNullOrWhiteSpace(licensePlate))
                    {
                        System.Diagnostics.Debug.WriteLine($"Camera {deviceIndex}: License plate detected - {licensePlate}");

                        // Notify subscribers about the detected license plate
                        await Avalonia.Threading.Dispatcher.UIThread.InvokeAsync(() =>
                        {
                            LicensePlateDetected?.Invoke(deviceIndex, licensePlate, 0.8f); // Default confidence
                        });
                    }
                    else
                    {
                        // License plate detection returned empty string - notify user
                        System.Diagnostics.Debug.WriteLine($"Camera {deviceIndex}: License plate detected but could not read clearly");

                        // Show notification about unreadable license plate
                        await _notificationService.ShowWarningNotificationAsync(
                             Resources.TextResource.NotificationLicensePlateDetectionTitle,
                             string.Format(Resources.TextResource.NotificationLicensePlateUnreadableMessage, deviceIndex));
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Camera {deviceIndex}: License plate recognition error - {ex.Message}");
            }
        }

        private static Bitmap? ConvertMatToBitmap(Mat mat)
        {
            try
            {
                if (mat.Empty())
                    return null;

                using var rgbMat = new Mat();
                Cv2.CvtColor(mat, rgbMat, ColorConversionCodes.BGR2RGB);

                var success = Cv2.ImEncode(".png", rgbMat, out var imageData);
                if (!success || imageData.Length == 0)
                    return null;

                using var stream = new MemoryStream(imageData);
                return new Bitmap(stream);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Convert to bitmap error - {ex.Message}");
                return null;
            }
        }

        public void Dispose()
        {
            ReleaseAllCameras();

            System.Diagnostics.Debug.WriteLine("CameraService disposed");
        }

        public bool IsDetectingEntrance() => _isDetectingEntrance;

        public bool IsDetectingExit() => _isDetectingExit;

        public void SetIsDetectingEntrance(bool status)
        {
            _isDetectingEntrance = status;
        }

        public void SetIsDetectingExit(bool status)
        {
            _isDetectingExit = status;
        }
    }
}