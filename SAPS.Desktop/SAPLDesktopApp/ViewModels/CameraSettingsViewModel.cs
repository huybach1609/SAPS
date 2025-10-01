using Avalonia.Media.Imaging;
using ReactiveUI;
using SAPLDesktopApp.Models;
using SAPLDesktopApp.Services;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Reactive;
using System.Threading.Tasks;

namespace SAPLDesktopApp.ViewModels
{
    public sealed class CameraSettingsViewModel : ViewModelBase, IDisposable, IRoutableViewModel
    {
        public string? UrlPathSegment { get; }
        public IScreen HostScreen { get; }

        private readonly ICameraService _cameraService;
        private readonly ILoadingService _loadingService;
        private readonly ICameraSettingsService _settingsService;

        public ObservableCollection<CameraDevice> AvailableCameras { get; }

        // Camera assignments (using SelectedItem instead of indices)
        private CameraDevice? _frontEntranceSelectedCamera;
        private CameraDevice? _backEntranceSelectedCamera;
        private CameraDevice? _frontExitSelectedCamera;
        private CameraDevice? _backExitSelectedCamera;

        public CameraDevice? FrontEntranceSelectedCamera
        {
            get => _frontEntranceSelectedCamera;
            set => this.RaiseAndSetIfChanged(ref _frontEntranceSelectedCamera, value);
        }

        public CameraDevice? BackEntranceSelectedCamera
        {
            get => _backEntranceSelectedCamera;
            set => this.RaiseAndSetIfChanged(ref _backEntranceSelectedCamera, value);
        }

        public CameraDevice? FrontExitSelectedCamera
        {
            get => _frontExitSelectedCamera;
            set => this.RaiseAndSetIfChanged(ref _frontExitSelectedCamera, value);
        }

        public CameraDevice? BackExitSelectedCamera
        {
            get => _backExitSelectedCamera;
            set => this.RaiseAndSetIfChanged(ref _backExitSelectedCamera, value);
        }

        public ReactiveCommand<Unit, Unit> BackCommand { get; }
        public ReactiveCommand<Unit, Unit> SaveSettingsCommand { get; }
        public ReactiveCommand<Unit, Unit> RefreshCamerasCommand { get; }

        public CameraSettingsViewModel(IScreen screen, ICameraService cameraService, ILoadingService loadingService)
        {
            HostScreen = screen;
            UrlPathSegment = "camera-settings";

            _cameraService = cameraService;
            _loadingService = loadingService;
            _settingsService = ServiceLocator.GetService<ICameraSettingsService>();

            AvailableCameras = new ObservableCollection<CameraDevice>();

            BackCommand = ReactiveCommand.Create(GoBack);
            SaveSettingsCommand = ReactiveCommand.CreateFromTask(SaveSettings);
            RefreshCamerasCommand = ReactiveCommand.CreateFromTask(LoadCameras);

            // Load cameras first, then settings
            _ = LoadCamerasAndSettings();
        }

        private async Task LoadCamerasAndSettings()
        {
            await LoadCameras();
            LoadSettings(); // Call after cameras are loaded
        }

        private async void LoadSettings()
        {
            var assignments = await _settingsService.LoadCameraAssignmentsAsync();
            
            // Find cameras by index
            FrontEntranceSelectedCamera = AvailableCameras.FirstOrDefault(c => c.CameraIndex == assignments.FrontEntranceCameraIndex);
            BackEntranceSelectedCamera = AvailableCameras.FirstOrDefault(c => c.CameraIndex == assignments.BackEntranceCameraIndex);
            FrontExitSelectedCamera = AvailableCameras.FirstOrDefault(c => c.CameraIndex == assignments.FrontExitCameraIndex);
            BackExitSelectedCamera = AvailableCameras.FirstOrDefault(c => c.CameraIndex == assignments.BackExitCameraIndex);
        }

        private async Task LoadCameras()
        {
            await _loadingService.ExecuteWithLoadingAsync(async () =>
            {
                // Stop existing cameras
                StopAllCameras();
                AvailableCameras.Clear();

                // Get available cameras
                var cameraDevices = await _cameraService.GetAvailableCameras();
                int progress = 0;

                foreach (var device in cameraDevices)
                {
                    var cameraModel = new CameraDevice
                    {
                        DeviceInfo = device,
                        CameraIndex = device.Index,
                        Name = device.Name,
                        DeviceId = device.DeviceId,
                        Description = device.Description,
                        Manufacturer = device.Manufacturer,
                        IsAvailable = false,
                        IsStreaming = false
                    };

                    // Try to initialize the camera
                    bool isInitialized = await Task.Run(() => _cameraService.Initialize(device.Index));
                    if (isInitialized)
                    {
                        // Subscribe to frame events
                        _cameraService.NewFrameReceived += OnNewFrameReceived;

                        // Start the camera
                        bool isStarted = await Task.Run(() => _cameraService.Start(device.Index));
                        cameraModel.IsAvailable = isStarted;
                        cameraModel.IsStreaming = isStarted;
                    }

                    AvailableCameras.Add(cameraModel);

                    // Update progress
                    await Task.Delay(100);
                    double value = (double)++progress / cameraDevices.Count * 100;
                    _loadingService.UpdateProgress(value, string.Format(Resources.TextResource.LoadingInitializingCamera, device.Name));
                }
            }, Resources.TextResource.LoadingDetectingCameras, Resources.TextResource.LoadingScanningDevices);
        }

        private void OnNewFrameReceived(int cameraIndex, Bitmap? frame)
        {
            var camera = AvailableCameras.FirstOrDefault(c => c.CameraIndex == cameraIndex);
            if (camera != null)
            {
                camera.LiveFrame = frame;
            }
        }

        private void StopAllCameras()
        {
            foreach (var camera in AvailableCameras)
            {
                _cameraService.Stop(camera.DeviceInfo.Index);
            }
        }

        private async Task SaveSettings()
        {
            var assignments = new CameraAssignments
            {
                FrontEntranceCameraIndex = FrontEntranceSelectedCamera?.CameraIndex,
                BackEntranceCameraIndex = BackEntranceSelectedCamera?.CameraIndex,
                FrontExitCameraIndex = FrontExitSelectedCamera?.CameraIndex,
                BackExitCameraIndex = BackExitSelectedCamera?.CameraIndex
            };

            await _settingsService.SaveCameraAssignmentsAsync(assignments);

            GoBack();
        }

        private void GoBack()
        {
            StopAllCameras();
            HostScreen.Router.NavigateBack.Execute().Subscribe();
        }

        public void Dispose()
        {
            StopAllCameras();

            foreach (var camera in AvailableCameras)
            {
                camera.LiveFrame?.Dispose();
            }
        }
    }
}