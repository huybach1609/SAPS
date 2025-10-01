using Avalonia.Media.Imaging;
using ReactiveUI;

namespace SAPLDesktopApp.Models
{
    /// <summary>
    /// Camera device information detected from the system
    /// </summary>
    public class CameraDeviceInfo
    {
        /// <summary>
        /// The camera index for OpenCV
        /// </summary>
        public int Index { get; set; } = -1;

        /// <summary>
        /// The name/description of the camera device
        /// </summary>
        public string Name { get; set; } = "";

        /// <summary>
        /// The device identifier string
        /// </summary>
        public string DeviceId { get; set; } = "";

        /// <summary>
        /// Whether the camera is currently available/active
        /// </summary>
        public bool IsAvailable { get; set; } = true;

        /// <summary>
        /// The manufacturer of the device (if available)
        /// </summary>
        public string Manufacturer { get; set; } = "";

        /// <summary>
        /// Additional device description or service information
        /// </summary>
        public string Description { get; set; } = "";
    }

    /// <summary>
    /// Model representing a camera device for UI binding (no service reference)
    /// </summary>
    public class CameraDevice : ReactiveObject
    {
        /// <summary>
        /// Camera device information
        /// </summary>
        public CameraDeviceInfo DeviceInfo { get; set; } = new();

        /// <summary>
        /// The name/description of the camera device
        /// </summary>
        public string Name
        {
            get => DeviceInfo.Name;
            set
            {
                DeviceInfo.Name = value;
                this.RaisePropertyChanged();
            }
        }

        /// <summary>
        /// The device ID or identifier
        /// </summary>
        public string DeviceId
        {
            get => DeviceInfo.DeviceId;
            set
            {
                DeviceInfo.DeviceId = value;
                this.RaisePropertyChanged();
            }
        }

        /// <summary>
        /// Whether the camera is currently available/active
        /// </summary>
        private bool _isAvailable = true;
        public bool IsAvailable
        {
            get => _isAvailable;
            set => this.RaiseAndSetIfChanged(ref _isAvailable, value);
        }

        /// <summary>
        /// The manufacturer of the device (if available)
        /// </summary>
        public string Manufacturer
        {
            get => DeviceInfo.Manufacturer;
            set
            {
                DeviceInfo.Manufacturer = value;
                this.RaisePropertyChanged();
            }
        }

        /// <summary>
        /// Additional device description or service information
        /// </summary>
        public string Description
        {
            get => DeviceInfo.Description;
            set
            {
                DeviceInfo.Description = value;
                this.RaisePropertyChanged();
            }
        }

        /// <summary>
        /// The camera index for OpenCV identification
        /// </summary>
        public int CameraIndex
        {
            get => DeviceInfo.Index;
            set
            {
                DeviceInfo.Index = value;
                this.RaisePropertyChanged();
            }
        }

        /// <summary>
        /// Live camera frame/preview image
        /// </summary>
        private Bitmap? _liveFrame;
        public Bitmap? LiveFrame
        {
            get => _liveFrame;
            set => this.RaiseAndSetIfChanged(ref _liveFrame, value);
        }

        /// <summary>
        /// Whether the camera is currently streaming
        /// </summary>
        private bool _isStreaming;
        public bool IsStreaming
        {
            get => _isStreaming;
            set => this.RaiseAndSetIfChanged(ref _isStreaming, value);
        }

        /// <summary>
        /// Unique identifier for this camera device
        /// </summary>
        public string UniqueId => $"opencv-{DeviceInfo.Index}";
    }
}