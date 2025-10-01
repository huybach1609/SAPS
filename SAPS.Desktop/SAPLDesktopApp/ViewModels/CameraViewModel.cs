using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Media;
using Avalonia.Media.Imaging;
using Microsoft.Extensions.DependencyInjection;
using ReactiveUI;
using SAPLDesktopApp.Constants;
using SAPLDesktopApp.Controls;
using SAPLDesktopApp.DTOs.Concrete.ParkingSessionDtos;
using SAPLDesktopApp.DTOs.Concrete.VehicleDtos;
using SAPLDesktopApp.Models;
using SAPLDesktopApp.Resources;
using SAPLDesktopApp.Services;
using System;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Reactive;
using System.Reactive.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SAPLDesktopApp.ViewModels
{
    public class CameraViewModel : ViewModelBase, IRoutableViewModel
    {
        public string? UrlPathSegment { get; }
        public IScreen HostScreen { get; }

        // Camera images for the 4 feeds (live feeds)
        private Bitmap? _frontEntranceCameraFrame;
        private Bitmap? _backEntranceCameraFrame;
        private Bitmap? _frontExitCameraFrame;
        private Bitmap? _backExitCameraFrame;

        // Captured images for sidebar display
        private Bitmap? _capturedFrontEntranceImage;
        private Bitmap? _capturedBackEntranceImage;
        private Bitmap? _capturedFrontExitImage;
        private Bitmap? _capturedBackExitImage;

        // License plate detection properties
        private string _detectedCheckInPlate = "";
        private string _detectedCheckOutPlate = "";
        private DateTime _lastCheckInDetection = DateTime.MinValue;
        private DateTime _lastCheckOutDetection = DateTime.MinValue;
        private bool _autoFillLicensePlate = true;

        // License plate testing properties
        private ObservableCollection<string> _detectedLicensePlates = new();

        // Sidebar properties
        private ParkingSessionDetails? _currentSessionDetails;
        private bool _isSidebarOpen = false;
        private string _sidebarMode = "";
        private string _vehiclePlateNumber = "";
        private string _captureTimestamp = "";

        // Vehicle type properties
        private string _selectedVehicleType = VehicleType.Car.ToString();
        private ObservableCollection<string> _availableVehicleTypes = new();
        private bool _showVehicleTypeDropdown = false;

        // New flow properties
        private bool _hasSessionDetails = false;
        private bool _showConfirmation = false;
        private bool _isProcessing = false;

        // Services
        private readonly INotificationService _notificationService;
        private readonly IParkingSessionService _parkingSessionService;
        private readonly ICameraService _cameraService;
        private readonly ICameraSettingsService _settingsService;
        private readonly IVehicleService _vehicleService;
        private readonly IFileManagementService _fileManagementService;

        private CameraAssignments? _currentAssignments;

        // Live camera feed properties
        public Bitmap? FrontEntranceCameraFrame
        {
            get => _frontEntranceCameraFrame;
            set => this.RaiseAndSetIfChanged(ref _frontEntranceCameraFrame, value);
        }
        public Bitmap? BackEntranceCameraFrame
        {
            get => _backEntranceCameraFrame;
            set => this.RaiseAndSetIfChanged(ref _backEntranceCameraFrame, value);
        }
        public Bitmap? FrontExitCameraFrame
        {
            get => _frontExitCameraFrame;
            set => this.RaiseAndSetIfChanged(ref _frontExitCameraFrame, value);
        }
        public Bitmap? BackExitCameraFrame
        {
            get => _backExitCameraFrame;
            set => this.RaiseAndSetIfChanged(ref _backExitCameraFrame, value);
        }

        // Captured images for sidebar
        public Bitmap? CapturedFrontEntranceImage
        {
            get => _capturedFrontEntranceImage;
            set => this.RaiseAndSetIfChanged(ref _capturedFrontEntranceImage, value);
        }
        public Bitmap? CapturedBackEntranceImage
        {
            get => _capturedBackEntranceImage;
            set => this.RaiseAndSetIfChanged(ref _capturedBackEntranceImage, value);
        }
        public Bitmap? CapturedFrontExitImage
        {
            get => _capturedFrontExitImage;
            set => this.RaiseAndSetIfChanged(ref _capturedFrontExitImage, value);
        }
        public Bitmap? CapturedBackExitImage
        {
            get => _capturedBackExitImage;
            set => this.RaiseAndSetIfChanged(ref _capturedBackExitImage, value);
        }

        // License plate detection properties
        public string DetectedCheckInPlate
        {
            get => _detectedCheckInPlate;
            set => this.RaiseAndSetIfChanged(ref _detectedCheckInPlate, value);
        }

        public string DetectedCheckOutPlate
        {
            get => _detectedCheckOutPlate;
            set => this.RaiseAndSetIfChanged(ref _detectedCheckOutPlate, value);
        }

        public bool AutoFillLicensePlate
        {
            get => _autoFillLicensePlate;
            set => this.RaiseAndSetIfChanged(ref _autoFillLicensePlate, value);
        }

        // Vehicle type properties
        public string SelectedVehicleType
        {
            get => _selectedVehicleType;
            set => this.RaiseAndSetIfChanged(ref _selectedVehicleType, value);
        }
        
        public ObservableCollection<string> AvailableVehicleTypes
        {
            get => _availableVehicleTypes;
            set => this.RaiseAndSetIfChanged(ref _availableVehicleTypes, value);
        }
        
        public bool ShowVehicleTypeDropdown
        {
            get => _showVehicleTypeDropdown;
            set => this.RaiseAndSetIfChanged(ref _showVehicleTypeDropdown, value);
        }

        public ObservableCollection<string> DetectedLicensePlates
        {
            get => _detectedLicensePlates;
            set => this.RaiseAndSetIfChanged(ref _detectedLicensePlates, value);
        }

        public string CheckInDetectionTime => _lastCheckInDetection != DateTime.MinValue 
            ? string.Format(Resources.TextResource.LabelLastDetectedTime, _lastCheckInDetection.ToString("HH:mm:ss"))
            : "";

        public string CheckOutDetectionTime => _lastCheckOutDetection != DateTime.MinValue 
            ? string.Format(Resources.TextResource.LabelLastDetectedTime, _lastCheckOutDetection.ToString("HH:mm:ss"))
            : "";

        public bool HasCheckInDetection => !string.IsNullOrWhiteSpace(DetectedCheckInPlate);
        public bool HasCheckOutDetection => !string.IsNullOrWhiteSpace(DetectedCheckOutPlate);

        private CameraViewModelSideBarMode? _currentCameraViewModelSideBarMode;
        public bool IsSidebarOpen
        {
            get => _isSidebarOpen;
            set => this.RaiseAndSetIfChanged(ref _isSidebarOpen, value);
        }
        public string SidebarMode
        {
            get => _sidebarMode;
            set => this.RaiseAndSetIfChanged(ref _sidebarMode, value);
        }
        public string VehiclePlateNumber
        {
            get => _vehiclePlateNumber;
            set => this.RaiseAndSetIfChanged(ref _vehiclePlateNumber, value);
        }
        public string CaptureTimestamp
        {
            get => _captureTimestamp;
            set => this.RaiseAndSetIfChanged(ref _captureTimestamp, value);
        }

        public ParkingSessionDetails? CurrentSessionDetails
        {
            get => _currentSessionDetails;
            set => this.RaiseAndSetIfChanged(ref _currentSessionDetails, value);
        }
        public bool HasSessionDetails
        {
            get => _hasSessionDetails;
            set => this.RaiseAndSetIfChanged(ref _hasSessionDetails, value);
        }
        public bool ShowConfirmation
        {
            get => _showConfirmation;
            set => this.RaiseAndSetIfChanged(ref _showConfirmation, value);
        }
        public bool IsProcessing
        {
            get => _isProcessing;
            set => this.RaiseAndSetIfChanged(ref _isProcessing, value);
        }

        // UI convenience properties
        public string OwnerName => CurrentSessionDetails?.Owner?.FullName ?? Resources.TextResource.UnknownOwnerName;
        public string OwnerPhone => CurrentSessionDetails?.Owner?.PhoneNumber ?? Resources.TextResource.NotProvidedText;
        public string VehicleInfo => CurrentSessionDetails?.Vehicle != null
            ? $"{CurrentSessionDetails.Vehicle.Brand} {CurrentSessionDetails.Vehicle.Model} ({CurrentSessionDetails.Vehicle.Color})"
            : Resources.TextResource.UnknownVehicleText;
        public string CheckInTime => CurrentSessionDetails?.EntryTime ?? "";
        public string CheckOutTime => CurrentSessionDetails?.ExitTime ?? "-";
        public string ParkingDuration => CurrentSessionDetails?.Duration ?? "-";
        public string ParkingFee => CurrentSessionDetails?.Fee ?? "-";
        public string SessionStatus => CurrentSessionDetails?.LocalizedStatus ?? Resources.TextResource.UnknownText;
        public string PaymentStatus => CurrentSessionDetails?.LocalizedPaymentStatus ?? Resources.TextResource.UnknownText;

        public GridLength SidebarWidth => IsSidebarOpen ?
            new GridLength(Application.Current?.FindResource("SidebarWidth") as double? ?? 320) :
            new GridLength(0);

        public bool IsCheckOutMode => _currentCameraViewModelSideBarMode == CameraViewModelSideBarMode.CheckOut;
        public bool IsCheckInMode => _currentCameraViewModelSideBarMode == CameraViewModelSideBarMode.CheckIn;
        public bool HasCapturedImages => HasCheckedInCapturedImages || HasCheckedOutCapturedImages;
        public bool HasCheckedInCapturedImages => (CapturedFrontEntranceImage != null || CapturedBackEntranceImage != null);
        public bool HasCheckedOutCapturedImages => (CapturedFrontExitImage != null || CapturedBackExitImage != null);
        public bool CanProcess => !string.IsNullOrWhiteSpace(VehiclePlateNumber) && !ShowConfirmation && !IsProcessing;
        public bool CanConfirm => ShowConfirmation && !IsProcessing;
        public bool CanRefreshSession => IsCheckOutMode && CurrentSessionDetails != null && !IsProcessing;
        public bool CanGetSessionPaymentInformation => IsCheckOutMode && CurrentSessionDetails != null 
            && CurrentSessionDetails.PaymentStatus != ParkingSessionPayStatus.Paid.ToString();

        // Button styling properties
        public string SidebarIcon => IsCheckInMode ? "🚗" : "🚪";
        public string ProcessButtonText => IsCheckInMode ? Resources.TextResource.ProcessCheckinButton : Resources.TextResource.ProcessCheckoutButton;
        public string ConfirmButtonText => IsCheckInMode ? Resources.TextResource.ConfirmCheckInButtonText : Resources.TextResource.ConfirmCheckOutButtonText;

        public IBrush ProcessButtonBackground => IsCheckInMode
            ? Application.Current?.FindResource("NotificationCheckInBrush") as IBrush ?? new SolidColorBrush(Color.Parse("#4CAF50"))
            : Application.Current?.FindResource("NotificationCheckOutBrush") as IBrush ?? new SolidColorBrush(Color.Parse("#F44336"));

        public IBrush ConfirmButtonBackground => IsCheckInMode
            ? Application.Current?.FindResource("AccentSuccessBrush") as IBrush ?? new SolidColorBrush(Color.Parse("#27ae60"))
            : Application.Current?.FindResource("AccentDangerBrush") as IBrush ?? new SolidColorBrush(Color.Parse("#e74c3c"));

        public ObservableCollection<CameraButton> CameraButtons { get; }

        // Commands
        public ReactiveCommand<Unit, Unit> SettingsCommand { get; }
        public ReactiveCommand<Unit, Unit> CheckInManuallyCommand { get; }
        public ReactiveCommand<Unit, Unit> CheckOutManuallyCommand { get; }
        public ReactiveCommand<Unit, Unit> CloseSidebarCommand { get; }
        public ReactiveCommand<Unit, Unit> ProcessCommand { get; }
        public ReactiveCommand<Unit, Unit> ConfirmCommand { get; }
        public ReactiveCommand<Unit, Unit> CaptureImagesCommand { get; }
        public ReactiveCommand<Unit, Unit> UseCheckInPlateCommand { get; }
        public ReactiveCommand<Unit, Unit> UseCheckOutPlateCommand { get; }
        public ReactiveCommand<Unit, Unit> RefreshSessionCommand { get; }
        public ReactiveCommand<Unit, Unit> ShowPaymentInfoCommand { get; }

        public CameraViewModel(IScreen hostScreen, INotificationService notificationService, ICameraService cameraService)
        {
            HostScreen = hostScreen ?? throw new ArgumentNullException(nameof(hostScreen));
            _notificationService = notificationService ?? throw new ArgumentNullException(nameof(notificationService));
            _cameraService = cameraService ?? throw new ArgumentNullException(nameof(cameraService));
            _parkingSessionService = ServiceLocator.GetService<IParkingSessionService>();
            _settingsService = ServiceLocator.GetService<ICameraSettingsService>();
            _vehicleService = ServiceLocator.GetService<IVehicleService>();
            _fileManagementService = ServiceLocator.GetService<IFileManagementService>();

            UrlPathSegment = StringKeys.CameraViews;

            // Initialize available vehicle types from the enum
            foreach (VehicleType vehicleType in Enum.GetValues(typeof(VehicleType)))
            {
                AvailableVehicleTypes.Add(vehicleType.ToString());
            }
            SelectedVehicleType = VehicleType.Car.ToString();

            SettingsCommand = ReactiveCommand.Create(OpenSettings);
            CheckInManuallyCommand = ReactiveCommand.CreateFromTask(OpenCheckInSidebarAsync);
            CheckOutManuallyCommand = ReactiveCommand.CreateFromTask(OpenCheckOutSidebarAsync);
            CloseSidebarCommand = ReactiveCommand.Create(CloseSidebar);
            ProcessCommand = ReactiveCommand.CreateFromTask(ProcessAction);
            ConfirmCommand = ReactiveCommand.CreateFromTask(ConfirmAction);
            CaptureImagesCommand = ReactiveCommand.Create(CaptureImages);
            UseCheckInPlateCommand = ReactiveCommand.Create(UseDetectedCheckInPlate);
            UseCheckOutPlateCommand = ReactiveCommand.Create(UseDetectedCheckOutPlate);
            RefreshSessionCommand = ReactiveCommand.CreateFromTask(RefreshSessionDetails);
            ShowPaymentInfoCommand = ReactiveCommand.CreateFromTask(ShowPaymentInfo);

            CameraButtons = new ObservableCollection<CameraButton>
            {
                new CameraButton
                {
                    Content = TextResource.BtnSettings,
                    Tooltip = TextResource.TooltipSettings,
                    Background = "#333",
                    Foreground = "White",
                    Command = SettingsCommand
                },
                new CameraButton
                {
                    Content = TextResource.BtnCheckInManually,
                    Tooltip = TextResource.TooltipManuallyCheckIn,
                    Background = "#4CAF50",
                    Foreground = "White",
                    Command = CheckInManuallyCommand
                },
                new CameraButton
                {
                    Content = TextResource.BtnCheckOutManually,
                    Tooltip = TextResource.TooltipManuallyCheckOut,
                    Background = "#F44336",
                    Foreground = "White",
                    Command = CheckOutManuallyCommand
                },
            };

            this.WhenAnyValue(x => x.IsSidebarOpen)
                .Subscribe(_ => this.RaisePropertyChanged(nameof(SidebarWidth)));

            this.WhenAnyValue(x => x.SidebarMode)
                .Subscribe(_ =>
                {
                    this.RaisePropertyChanged(nameof(IsCheckOutMode));
                    this.RaisePropertyChanged(nameof(IsCheckInMode));
                    this.RaisePropertyChanged(nameof(HasCheckedInCapturedImages));
                    this.RaisePropertyChanged(nameof(HasCheckedOutCapturedImages));
                    this.RaisePropertyChanged(nameof(HasCapturedImages));
                    this.RaisePropertyChanged(nameof(SidebarIcon));
                    this.RaisePropertyChanged(nameof(ProcessButtonText));
                    this.RaisePropertyChanged(nameof(ConfirmButtonText));
                    this.RaisePropertyChanged(nameof(ProcessButtonBackground));
                    this.RaisePropertyChanged(nameof(ConfirmButtonBackground));
                    this.RaisePropertyChanged(nameof(CanRefreshSession));
                    this.RaisePropertyChanged(nameof(CanGetSessionPaymentInformation));
                });

            this.WhenAnyValue(x => x.VehiclePlateNumber, x => x.ShowConfirmation, x => x.IsProcessing)
                .Subscribe(_ =>
                {
                    this.RaisePropertyChanged(nameof(CanProcess));
                    this.RaisePropertyChanged(nameof(CanConfirm));
                    this.RaisePropertyChanged(nameof(CanRefreshSession));
                    this.RaisePropertyChanged(nameof(CanGetSessionPaymentInformation));
                });

            this.WhenAnyValue(x => x.CapturedFrontEntranceImage, x => x.CapturedBackEntranceImage)
                .Subscribe(_ => this.RaisePropertyChanged(nameof(HasCheckedInCapturedImages)));

            this.WhenAnyValue(x => x.CapturedFrontExitImage, x => x.CapturedBackExitImage)
                .Subscribe(_ => this.RaisePropertyChanged(nameof(HasCheckedOutCapturedImages)));

            this.WhenAnyValue(x => x.HasCheckedInCapturedImages, x => x.HasCheckedOutCapturedImages)
                .Subscribe(_ => this.RaisePropertyChanged(nameof(HasCapturedImages)));

            this.WhenAnyValue(x => x.VehiclePlateNumber, x => x.ShowConfirmation, x => x.IsProcessing)
                .Subscribe(_ =>
                {
                    this.RaisePropertyChanged(nameof(CanProcess));
                    this.RaisePropertyChanged(nameof(CanConfirm));
                    this.RaisePropertyChanged(nameof(CanRefreshSession));
                    this.RaisePropertyChanged(nameof(CanGetSessionPaymentInformation));
                });

            this.WhenAnyValue(x => x.SidebarMode)
                .Subscribe(_ =>
                {
                    this.RaisePropertyChanged(nameof(IsCheckOutMode));
                    this.RaisePropertyChanged(nameof(IsCheckInMode));
                    this.RaisePropertyChanged(nameof(HasCheckedInCapturedImages));
                    this.RaisePropertyChanged(nameof(HasCheckedOutCapturedImages));
                    this.RaisePropertyChanged(nameof(HasCapturedImages));
                    this.RaisePropertyChanged(nameof(SidebarIcon));
                    this.RaisePropertyChanged(nameof(ProcessButtonText));
                    this.RaisePropertyChanged(nameof(ConfirmButtonText));
                    this.RaisePropertyChanged(nameof(ProcessButtonBackground));
                    this.RaisePropertyChanged(nameof(ConfirmButtonBackground));
                    this.RaisePropertyChanged(nameof(CanRefreshSession));
                    this.RaisePropertyChanged(nameof(CanGetSessionPaymentInformation));
                });

            this.WhenAnyValue(x => x.CurrentSessionDetails)
                .Subscribe(_ =>
                {
                    this.RaisePropertyChanged(nameof(OwnerName));
                    this.RaisePropertyChanged(nameof(OwnerPhone));
                    this.RaisePropertyChanged(nameof(VehicleInfo));
                    this.RaisePropertyChanged(nameof(CheckInTime));
                    this.RaisePropertyChanged(nameof(CheckOutTime));
                    this.RaisePropertyChanged(nameof(ParkingDuration));
                    this.RaisePropertyChanged(nameof(ParkingFee));
                    this.RaisePropertyChanged(nameof(SessionStatus));
                    this.RaisePropertyChanged(nameof(PaymentStatus));
                });

            this.WhenAnyValue(x => x.DetectedCheckInPlate)
                .Subscribe(_ =>
                {
                    this.RaisePropertyChanged(nameof(HasCheckInDetection));
                    this.RaisePropertyChanged(nameof(CheckInDetectionTime));
                });

            this.WhenAnyValue(x => x.DetectedCheckOutPlate)
                .Subscribe(_ =>
                {
                    this.RaisePropertyChanged(nameof(HasCheckOutDetection));
                    this.RaisePropertyChanged(nameof(CheckOutDetectionTime));
                });

            // Subscribe to camera events (cameras are already running from MainWindowViewModel)
            _ = SubscribeToCameraEvents();
        }

        /// <summary>
        /// Subscribe to camera events and load current assignments for frame mapping
        /// </summary>
        private async Task SubscribeToCameraEvents()
        {
            try
            {
                // Load camera assignments for frame mapping
                _currentAssignments = await _settingsService.LoadCameraAssignmentsAsync();
                
                // Subscribe to events - cameras are already running from MainWindowViewModel
                _cameraService.NewFrameReceived += OnCameraFrameReceived;
                
                System.Diagnostics.Debug.WriteLine("CameraViewModel: Subscribed to camera events");
            }
            catch (Exception ex)
            {
                await _notificationService.ShowErrorNotificationAsync(Resources.TextResource.NotificationCameraErrorTitle, 
                    string.Format(Resources.TextResource.NotificationCameraSubscriptionFailedMessage, ex.Message));
            }
        }

        private void OnCameraFrameReceived(int cameraIndex, Bitmap? frame)
        {
            if (_currentAssignments == null) return;

            // Map camera index to the appropriate frame property
            if (_currentAssignments.FrontEntranceCameraIndex == cameraIndex)
                FrontEntranceCameraFrame = frame;
            else if (_currentAssignments.BackEntranceCameraIndex == cameraIndex)
                BackEntranceCameraFrame = frame;
            else if (_currentAssignments.FrontExitCameraIndex == cameraIndex)
                FrontExitCameraFrame = frame;
            else if (_currentAssignments.BackExitCameraIndex == cameraIndex)
                BackExitCameraFrame = frame;
        }

        private void OnLicensePlateDetected(int cameraIndex, string licensePlate, float confidence)
        {
            try
            {
                if (_currentAssignments == null) return;

                bool isEntranceCamera = _currentAssignments.FrontEntranceCameraIndex == cameraIndex ||
                                       _currentAssignments.BackEntranceCameraIndex == cameraIndex;
                
                bool isExitCamera = _currentAssignments.FrontExitCameraIndex == cameraIndex ||
                                   _currentAssignments.BackExitCameraIndex == cameraIndex;

                // Add to detected license plates collection for testing
                var detectionInfo = string.Format(Resources.TextResource.DetectionInfoFormat, DateTime.Now.ToString("HH:mm:ss"), cameraIndex, licensePlate, confidence.ToString("P1"));
                DetectedLicensePlates.Insert(0, detectionInfo);
                
                // Keep only the latest 10 detections
                while (DetectedLicensePlates.Count > 10)
                {
                    DetectedLicensePlates.RemoveAt(DetectedLicensePlates.Count - 1);
                }

                if (isEntranceCamera)
                {
                    // Update check-in detection
                    DetectedCheckInPlate = licensePlate;
                    _lastCheckInDetection = DateTime.Now;
                    this.RaisePropertyChanged(nameof(CheckInDetectionTime));

                    // Auto-fill if in check-in mode and enabled
                    if (AutoFillLicensePlate && IsCheckInMode && string.IsNullOrWhiteSpace(VehiclePlateNumber))
                    {
                        VehiclePlateNumber = licensePlate;
                        Task.Run(async () =>
                        {
                            await _notificationService.ShowInfoNotificationAsync(Resources.TextResource.NotificationCheckInPlateDetectedTitle,
                                string.Format(Resources.TextResource.NotificationAutoFilledMessage, licensePlate));
                        });
                    }
                    else
                    {
                        Task.Run(async () =>
                        {
                            await _notificationService.ShowInfoNotificationAsync(Resources.TextResource.NotificationCheckInPlateDetectedTitle,
                                string.Format(Resources.TextResource.NotificationEntranceDetectedMessage, licensePlate));
                        });
                    }

                    System.Diagnostics.Debug.WriteLine($"Entrance camera {cameraIndex}: License plate detected - {licensePlate}");
                }
                else if (isExitCamera)
                {
                    // Update check-out detection
                    DetectedCheckOutPlate = licensePlate;
                    _lastCheckOutDetection = DateTime.Now;
                    this.RaisePropertyChanged(nameof(CheckOutDetectionTime));

                    // Auto-fill if in check-out mode and enabled
                    if (AutoFillLicensePlate && IsCheckOutMode && string.IsNullOrWhiteSpace(VehiclePlateNumber))
                    {
                        VehiclePlateNumber = licensePlate;
                        Task.Run(async () =>
                        {
                            await _notificationService.ShowInfoNotificationAsync(Resources.TextResource.NotificationCheckOutPlateDetectedTitle,
                                string.Format(Resources.TextResource.NotificationAutoFilledMessage, licensePlate));
                        });
                    }
                    else
                    {
                        Task.Run(async () =>
                        {
                            await _notificationService.ShowInfoNotificationAsync(Resources.TextResource.NotificationCheckOutPlateDetectedTitle,
                                string.Format(Resources.TextResource.NotificationExitDetectedMessage, licensePlate));
                        });
                    }

                    System.Diagnostics.Debug.WriteLine($"Exit camera {cameraIndex}: License plate detected - {licensePlate}");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error handling license plate detection: {ex.Message}");
            }
        }


        private void UseDetectedCheckInPlate()
        {
            if (!string.IsNullOrWhiteSpace(DetectedCheckInPlate))
            {
                VehiclePlateNumber = DetectedCheckInPlate;
            }
        }

        private void UseDetectedCheckOutPlate()
        {
            if (!string.IsNullOrWhiteSpace(DetectedCheckOutPlate))
            {
                VehiclePlateNumber = DetectedCheckOutPlate;
            }
        }

        private void OpenSettings()
        {
            var settingsViewModel = ActivatorUtilities.CreateInstance<CameraSettingsViewModel>(
                ServiceLocator.ServiceProvider, HostScreen, _cameraService, ServiceLocator.GetService<ILoadingService>());
            HostScreen.Router.Navigate.Execute(settingsViewModel);
        }

        /// <summary>
        /// Public method to open check-in sidebar - called from MainWindowViewModel
        /// </summary>
        public async Task OpenCheckInSidebarAsync()
        {
            try
            {
                _currentCameraViewModelSideBarMode = CameraViewModelSideBarMode.CheckIn;
                SidebarMode = "Check In";
                IsSidebarOpen = true;
                ResetSidebarState();
                CaptureEntranceImages();
            }
            catch (Exception ex)
            {
                await _notificationService.ShowErrorNotificationAsync(Resources.TextResource.NotificationTitleError,
                    string.Format(Resources.TextResource.NotificationFailedToOpenCheckInSidebarMessage, ex.Message));
            }
        }

        /// <summary>
        /// Public method to open check-out sidebar - called from MainWindowViewModel
        /// </summary>
        public async Task OpenCheckOutSidebarAsync()
        {
            try
            {
                _currentCameraViewModelSideBarMode = CameraViewModelSideBarMode.CheckOut;
                SidebarMode = "Check Out";
                IsSidebarOpen = true;
                ResetSidebarState();
                CaptureExitImages();
            }
            catch (Exception ex)
            {
                await _notificationService.ShowErrorNotificationAsync(Resources.TextResource.NotificationTitleError,
                    string.Format(Resources.TextResource.NotificationFailedToOpenCheckOutSidebarMessage, ex.Message));
            }
        }

        private void ResetSidebarState()
        {
            VehiclePlateNumber = "";
            ShowConfirmation = false;
            IsProcessing = false;
            CurrentSessionDetails = null;
            HasSessionDetails = false;
            ShowVehicleTypeDropdown = false;
            // Reset to default vehicle type
            SelectedVehicleType = VehicleType.Car.ToString();
        }

        private void CloseSidebar()
        {
            _currentCameraViewModelSideBarMode = null;
            IsSidebarOpen = false;
            SidebarMode = "";
            ResetSidebarState();
            ClearCapturedImages();
        }

        private void CaptureImages()
        {
            if (IsCheckInMode)
                CaptureEntranceImages();
            else if (IsCheckOutMode)
                CaptureExitImages();
        }

        private void CaptureEntranceImages()
        {
            CapturedFrontEntranceImage = CloneBitmap(FrontEntranceCameraFrame);
            CapturedBackEntranceImage = CloneBitmap(BackEntranceCameraFrame);
            CapturedFrontExitImage = null;
            CapturedBackExitImage = null;
            CaptureTimestamp = string.Format(Resources.TextResource.CapturedTimestampFormat, DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss"));
        }

        private void CaptureExitImages()
        {
            CapturedFrontExitImage = CloneBitmap(FrontExitCameraFrame);
            CapturedBackExitImage = CloneBitmap(BackExitCameraFrame);
            CapturedFrontEntranceImage = null;
            CapturedBackEntranceImage = null;
            CaptureTimestamp = string.Format(Resources.TextResource.CapturedTimestampFormat, DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss"));
        }

        private void ClearCapturedImages()
        {
            CapturedFrontEntranceImage?.Dispose();
            CapturedBackEntranceImage?.Dispose();
            CapturedFrontExitImage?.Dispose();
            CapturedBackExitImage?.Dispose();
            CapturedFrontEntranceImage = null;
            CapturedBackEntranceImage = null;
            CapturedFrontExitImage = null;
            CapturedBackExitImage = null;
            CaptureTimestamp = "";
        }

        private async Task ProcessAction()
        {
            if (string.IsNullOrWhiteSpace(VehiclePlateNumber))
                return;

            try
            {
                IsProcessing = true;

                if (_currentCameraViewModelSideBarMode == CameraViewModelSideBarMode.CheckIn)
                {
                    // Check-In Mode: Get vehicle details from VehicleService
                    await ProcessCheckInAction();
                }
                else if (_currentCameraViewModelSideBarMode == CameraViewModelSideBarMode.CheckOut)
                {
                    // Check-Out Mode: Get parking session details from ParkingSessionService
                    await ProcessCheckOutAction();
                }
            }
            catch (Exception ex)
            {
                await _notificationService.ShowErrorNotificationAsync(Resources.TextResource.NotificationProcessingErrorTitle,
                    string.Format(Resources.TextResource.NotificationProcessingVehicleInfoFailedMessage, ex.Message));
            }
            finally
            {
                IsProcessing = false;
            }
        }

        private async Task ProcessCheckInAction()
        {
            try
            {

                // Get vehicle details from VehicleService
                var vehicleDetails = await _vehicleService.GetVehicleByLicensePlateAsync(VehiclePlateNumber);
                // Check if vehicle is already checked in
                var existingSession = await _parkingSessionService.GetActiveSessionDetailsAsync(AuthenticationState.CurrentUser!.ParkingLotId!, VehiclePlateNumber);
                if (existingSession != null && existingSession.Status == ParkingSessionStatus.Parking.ToString())
                {
                    await _notificationService.ShowWarningNotificationAsync(Resources.TextResource.NotificationTitleAlreadyCheckedIn,
                        new StringBuilder().Append(VehiclePlateNumber)
                        .Append(Resources.TextResource.NotificationMessageVehicleAlreadyCheckedIn)
                        .Append(existingSession.EntryDateTime.ToLocalTime().ToString(TextResource.Culture))
                        .ToString());
                    return;
                }

                if (vehicleDetails == null)
                {
                    await _notificationService.ShowWarningNotificationAsync(Resources.TextResource.NotificationVehicleNotFoundTitle,
                        string.Format(Resources.TextResource.NotificationVehicleNotFoundMessage, VehiclePlateNumber));
                    
                    // Show vehicle type dropdown for new vehicle check-in
                    ShowVehicleTypeDropdown = true;
                    
                    // Create a temporary session details for new vehicle check-in
                    CurrentSessionDetails = new ParkingSessionDetails
                    {
                        LicensePlate = VehiclePlateNumber,
                        Vehicle = new VehicleSummary
                        {
                            LicensePlate = VehiclePlateNumber,
                            Brand = Resources.TextResource.UnknownText,
                            Model = Resources.TextResource.UnknownText,
                            Color = Resources.TextResource.UnknownText,
                            VehicleType = SelectedVehicleType,
                            Status = Resources.TextResource.UnknownText
                        },
                        Owner = new ClientSummary
                        {
                            FullName = Resources.TextResource.UnknownOwnerName,
                            PhoneNumber = Resources.TextResource.NotProvidedText
                        },
                        EntryDateTime = DateTime.Now,
                        Cost = 0,
                        Status = Resources.TextResource.StatusReadyForCheckIn
                    };
                }
                else
                {
                    // Hide vehicle type dropdown for existing vehicle check-in
                    ShowVehicleTypeDropdown = false;
                    
                    // Vehicle found, create session details
                    CurrentSessionDetails = new ParkingSessionDetails
                    {
                        LicensePlate = VehiclePlateNumber,
                        Vehicle = new VehicleSummary
                        {
                            LicensePlate = vehicleDetails.LicensePlate,
                            Brand = vehicleDetails.Brand,
                            Model = vehicleDetails.Model,
                            Color = vehicleDetails.Color,
                            VehicleType = vehicleDetails.VehicleType,
                            Status = vehicleDetails.Status
                        },
                        Owner = new ClientSummary
                        {
                            FullName = vehicleDetails.OwnerVehicleFullName,
                            PhoneNumber = Resources.TextResource.ContactAvailableText
                        },
                        EntryDateTime = DateTime.Now,
                        Cost = 0,
                        Status = Resources.TextResource.StatusReadyForCheckIn
                    };
                }

                HasSessionDetails = true;
                ShowConfirmation = true;

                await _notificationService.ShowInfoNotificationAsync(Resources.TextResource.NotificationReadyForCheckInTitle,
                    string.Format(Resources.TextResource.NotificationReadyForCheckInMessage, VehiclePlateNumber));

                System.Diagnostics.Debug.WriteLine($"CameraViewModel: Check-in processed for {VehiclePlateNumber}");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"CameraViewModel: Error in check-in processing: {ex.Message}");
                throw;
            }
        }

        private async Task ProcessCheckOutAction()
        {
            try
            {
                // Get active parking session details
                var sessionDetails = await _parkingSessionService.GetActiveSessionDetailsAsync(AuthenticationState.CurrentUser!.ParkingLotId!, VehiclePlateNumber);

                if (sessionDetails == null)
                {
                    await _notificationService.ShowWarningNotificationAsync(Resources.TextResource.NotificationNoActiveSessionTitle,
                        string.Format(Resources.TextResource.NotificationNoActiveSessionMessage, VehiclePlateNumber));
                    return;
                }

                // Use session ID as folder name (assuming sessionDetails has an Id property)
                var sessionId = sessionDetails.Id;
                if (string.IsNullOrEmpty(sessionId))
                {
                    System.Diagnostics.Debug.WriteLine("CameraViewModel: Session ID is null or empty, cannot manage files");
                }
                else
                {
                    // Check if folder exists and manage entry images
                    await ManageSessionImagesAsync(sessionId, sessionDetails);
                }

                // Convert DTO to model for UI display with null handling
                CurrentSessionDetails = new ParkingSessionDetails
                {
                    Id = sessionId,
                    LicensePlate = VehiclePlateNumber,
                    Vehicle = sessionDetails.Vehicle != null ? new VehicleSummary
                    {
                        LicensePlate = sessionDetails.Vehicle.LicensePlate ?? VehiclePlateNumber,
                        Brand = sessionDetails.Vehicle.Brand ?? Resources.TextResource.UnknownText,
                        Model = sessionDetails.Vehicle.Model ?? Resources.TextResource.UnknownText,
                        Color = sessionDetails.Vehicle.Color ?? Resources.TextResource.UnknownText,
                        VehicleType = sessionDetails.Vehicle.VehicleType ?? VehicleType.Car.ToString(),
                        Status = sessionDetails.Vehicle.Status ?? Resources.TextResource.UnknownText
                    } : new VehicleSummary
                    {
                        LicensePlate = VehiclePlateNumber,
                        Brand = Resources.TextResource.UnknownText,
                        Model = Resources.TextResource.UnknownText,
                        Color = Resources.TextResource.UnknownText,
                        VehicleType = VehicleType.Car.ToString(),
                        Status = Resources.TextResource.UnknownText
                    },
                    Owner = sessionDetails.Owner != null ? new ClientSummary
                    {
                        FullName = sessionDetails.Owner.FullName ?? Resources.TextResource.UnknownOwnerName,
                        PhoneNumber = sessionDetails.Owner.PhoneNumber ?? Resources.TextResource.NotProvidedText
                    } : new ClientSummary
                    {
                        FullName = Resources.TextResource.UnknownOwnerName,
                        PhoneNumber = Resources.TextResource.NotProvidedText
                    },
                    EntryDateTime = sessionDetails.EntryDateTime,
                    ExitDateTime = DateTime.UtcNow,
                    Cost = sessionDetails.Cost,
                    Status = sessionDetails.Status,  // Set actual status from DTO
                    PaymentStatus = sessionDetails.PaymentStatus,  // Set actual payment status from DTO
                    PaymentMethod = sessionDetails.PaymentMethod ?? Resources.TextResource.UnknownText
                };
                HasSessionDetails = true;
                ShowConfirmation = true;

                // Create more informative notification message
                var vehicleInfo = CurrentSessionDetails.Vehicle != null
                    ? $"{CurrentSessionDetails.Vehicle.Brand} {CurrentSessionDetails.Vehicle.Model}"
                    : Resources.TextResource.VehicleText;

                await _notificationService.ShowInfoNotificationAsync(Resources.TextResource.NotificationReadyForCheckOutTitle,
                    string.Format(Resources.TextResource.NotificationReadyForCheckOutMessage, vehicleInfo, VehiclePlateNumber,
                    CurrentSessionDetails.Duration, CurrentSessionDetails.Fee));

                System.Diagnostics.Debug.WriteLine($"CameraViewModel: Check-out processed for {VehiclePlateNumber}");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"CameraViewModel: Error in check-out processing: {ex.Message}");
                await _notificationService.ShowWarningNotificationAsync(Resources.TextResource.NotificationProcessingErrorTitle,
                    string.Format(Resources.TextResource.NotificationProcessingCheckOutFailedMessage, VehiclePlateNumber));
                throw;
            }
        }

        /// <summary>
        /// Manages parking session images by checking if they exist locally, loading them if available, or downloading them if needed
        /// </summary>
        private async Task ManageSessionImagesAsync(string sessionId, ParkingSessionDetailsForParkingLotDto sessionDetails)
        {
            try
            {
                const string frontEntryFileName = "front_entry.jpg";
                const string backEntryFileName = "back_entry.jpg";

                // Check if entry images exist locally using parking session-specific methods
                var frontEntryExists = _fileManagementService.DoesParkingSessionFileExist(sessionId, frontEntryFileName);
                var backEntryExists = _fileManagementService.DoesParkingSessionFileExist(sessionId, backEntryFileName);

                if (!frontEntryExists)
                {
                    await _fileManagementService.DownloadParkingSessionFileAsync(sessionDetails.EntryFrontCaptureUrl, 
                        sessionId, frontEntryFileName);
                }

                // Load existing images from local storage
                var frontImage = await _fileManagementService.LoadParkingSessionImageAsync(sessionId, frontEntryFileName);
                if (frontImage != null)
                {
                    CapturedFrontEntranceImage = frontImage;
                }
                System.Diagnostics.Debug.WriteLine($"CameraViewModel: Loaded existing parking session entry images for session {sessionId}");

                if (!backEntryExists)
                {
                    await _fileManagementService.DownloadParkingSessionFileAsync(sessionDetails.EntryBackCaptureUrl, 
                        sessionId, backEntryFileName);
                }
                var backImage = await _fileManagementService.LoadParkingSessionImageAsync(sessionId, backEntryFileName);
                if (backImage != null)
                {
                    CapturedBackEntranceImage = backImage;
                }
                System.Diagnostics.Debug.WriteLine($"CameraViewModel: Loaded existing parking session entry images for session {sessionId}");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"CameraViewModel: Error managing parking session images: {ex.Message}");
                // Don't throw - this is not critical for the checkout process
            }
        }

        private async Task ConfirmAction()
        {
            if (string.IsNullOrWhiteSpace(VehiclePlateNumber) || CurrentSessionDetails == null)
                return;

            try
            {
                IsProcessing = true;
                
                // Get current user information
                var currentUser = AuthenticationState.CurrentUser;
                if (currentUser == null)
                {
                    await _notificationService.ShowErrorNotificationAsync(Resources.TextResource.NotificationAuthenticationErrorTitle,
                        Resources.TextResource.NotificationAuthenticationErrorMessage);
                    return;
                }

                var parkingLotId = currentUser.ParkingLotId ?? "";

                if (_currentCameraViewModelSideBarMode == CameraViewModelSideBarMode.CheckIn)
                {
                    // Perform check-in
                    var checkInRequest = new CheckInParkingSessionRequest
                    {
                        // Use selected vehicle type when vehicle not found, otherwise use the type from vehicle details
                        VehicleType = ShowVehicleTypeDropdown ? SelectedVehicleType : (CurrentSessionDetails.Vehicle?.VehicleType ?? VehicleType.Car.ToString()),
                        ParkingLotId = parkingLotId,
                        VehicleLicensePlate = VehiclePlateNumber,
                        EntryFrontCapture = ParkingSessionService.BitmapToByteArray(CapturedFrontEntranceImage),
                        EntryBackCapture = ParkingSessionService.BitmapToByteArray(CapturedBackEntranceImage)
                    };
                    
                    await _parkingSessionService.CheckInAsync(checkInRequest);
                    await _notificationService.ShowCheckInNotificationAsync(VehiclePlateNumber, 
                        Resources.TextResource.NotificationSuccessfullyCheckedInMessage);
                    _cameraService.SetIsDetectingEntrance(true);
                    System.Diagnostics.Debug.WriteLine($"CameraViewModel: Vehicle {VehiclePlateNumber} checked in successfully");
                }
                else if (_currentCameraViewModelSideBarMode == CameraViewModelSideBarMode.CheckOut)
                {
                    // Perform check-out
                    var checkOutRequest = new FinishParkingSessionRequest
                    {
                        ParkingLotId = parkingLotId,
                        VehicleLicensePlate = VehiclePlateNumber,
                        ExitFrontCapture = ParkingSessionService.BitmapToByteArray(CapturedFrontExitImage),
                        ExitBackCapture = ParkingSessionService.BitmapToByteArray(CapturedBackExitImage)
                    };
                    
                    await _parkingSessionService.ManuallyCheckOutAsync(checkOutRequest);
                    await _notificationService.ShowCheckOutNotificationAsync(VehiclePlateNumber, 
                        string.Format(Resources.TextResource.NotificationSuccessfullyCheckedOutWithFeeMessage, CurrentSessionDetails.Fee));
                    _cameraService.SetIsDetectingExit(true);
                    System.Diagnostics.Debug.WriteLine($"CameraViewModel: Vehicle {VehiclePlateNumber} checked out successfully");
                }

                CloseSidebar();
            }
            catch (Exception ex)
            {
                await _notificationService.ShowErrorNotificationAsync(Resources.TextResource.NotificationProcessingErrorTitle,
                    string.Format(Resources.TextResource.NotificationFailedToConfirmActionMessage, ex.Message));
                System.Diagnostics.Debug.WriteLine($"CameraViewModel: Error confirming action: {ex.Message}");
            }
            finally
            {
                IsProcessing = false;
            }
        }

        private async Task RefreshSessionDetails()
        {
            if (string.IsNullOrWhiteSpace(VehiclePlateNumber) || !IsCheckOutMode)
                return;

            try
            {
                IsProcessing = true;
                
                // Re-process the checkout action to refresh session details
                await ProcessCheckOutAction();
                
                await _notificationService.ShowInfoNotificationAsync(
                    Resources.TextResource.NotificationTitleSuccess,
                    Resources.TextResource.NotificationSessionRefreshedMessage);
                
                System.Diagnostics.Debug.WriteLine($"CameraViewModel: Session details refreshed for {VehiclePlateNumber}");
            }
            catch (Exception ex)
            {
                await _notificationService.ShowErrorNotificationAsync(
                    Resources.TextResource.NotificationRefreshErrorTitle,
                    string.Format(Resources.TextResource.NotificationRefreshSessionFailedMessage, ex.Message));
                
                System.Diagnostics.Debug.WriteLine($"CameraViewModel: Error refreshing session: {ex.Message}");
            }
            finally
            {
                IsProcessing = false;
            }
        }

        /// <summary>
        /// Clean up event subscriptions when the view model is destroyed
        /// Note: We don't dispose cameras here as they are managed at the application level
        /// </summary>
        public void Cleanup()
        {
            _cameraService.NewFrameReceived -= OnCameraFrameReceived;
            _cameraService.LicensePlateDetected -= OnLicensePlateDetected;
            System.Diagnostics.Debug.WriteLine("CameraViewModel: Event subscriptions cleaned up");
        }

        private static Bitmap? CloneBitmap(Bitmap? source)
        {
            if (source == null) return null;
            try
            {
                using var stream = new MemoryStream();
                source.Save(stream);
                stream.Position = 0;
                return new Bitmap(stream);
            }
            catch
            {
                return source;
            }
        }

        private async Task ShowPaymentInfo()
        {
            try
            {
                // Validate current session details exist
                if (CurrentSessionDetails?.Id == null)
                {
                    await _notificationService.ShowWarningNotificationAsync(
                        Resources.TextResource.NotificationTitleWarning,
                        string.Format(Resources.TextResource.NotificationNoActiveSessionMessage, VehiclePlateNumber ?? Resources.TextResource.UnknownText));
                    System.Diagnostics.Debug.WriteLine("CameraViewModel: ShowPaymentInfo - No session details available");
                    return;
                }

                // Fetch payment information from service
                var paymentInfo = await _parkingSessionService.GetSessionPaymentInfoAsync(CurrentSessionDetails.Id);
                
                if (paymentInfo?.Data == null)
                {
                    await _notificationService.ShowWarningNotificationAsync(
                        Resources.TextResource.PaymentInfoTitle,
                        Resources.TextResource.NotProvidedText);
                    System.Diagnostics.Debug.WriteLine($"CameraViewModel: No payment information available for session {CurrentSessionDetails.Id}");
                    return;
                }

                // Open payment info window
                if (Application.Current?.ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
                {
                    var bankService = ServiceLocator.GetService<IBankService>();
                    var paymentInfoViewModel = new PaymentInfoViewModel(paymentInfo.Data, CurrentSessionDetails.Id, bankService);
                    
                    // Subscribe to payment completion event
                    paymentInfoViewModel.PaymentCompleted += OnPaymentCompleted;
                    
                    var paymentInfoWindow = new SAPLDesktopApp.Views.PaymentInfoWindow()
                    {
                        DataContext = paymentInfoViewModel
                    };
                    
                    await paymentInfoWindow.ShowDialog(desktop.MainWindow!);
                    
                    // Unsubscribe from event and dispose
                    paymentInfoViewModel.PaymentCompleted -= OnPaymentCompleted;
                    paymentInfoViewModel.Dispose();
                    
                    System.Diagnostics.Debug.WriteLine($"CameraViewModel: Payment info window displayed for session {CurrentSessionDetails.Id}");
                }
            }
            catch (Exception ex)
            {
                await _notificationService.ShowErrorNotificationAsync(
                    Resources.TextResource.NotificationTitleError,
                    string.Format(Resources.TextResource.NotificationFailedToLoadSessionDetailsMessage, ex.Message));
                System.Diagnostics.Debug.WriteLine($"CameraViewModel: Error in ShowPaymentInfo: {ex.Message}");
            }
        }

        /// <summary>
        /// Event handler for when payment is completed
        /// </summary>
        private async void OnPaymentCompleted()
        {
            try
            {
                System.Diagnostics.Debug.WriteLine("CameraViewModel: Payment completed, automatically confirming checkout");
                
                // Show notification about automatic confirmation
                await _notificationService.ShowCheckOutNotificationAsync(
                    VehiclePlateNumber,
                    Resources.TextResource.PaymentStatusPaid);
                
                // Automatically call ConfirmAction if in checkout mode
                if (IsCheckOutMode && CanConfirm)
                {
                    await ConfirmAction();
                }
            }
            catch (Exception ex)
            {
                await _notificationService.ShowErrorNotificationAsync(
                    Resources.TextResource.NotificationTitleError,
                    string.Format(Resources.TextResource.NotificationFailedToConfirmActionMessage, ex.Message));
                System.Diagnostics.Debug.WriteLine($"CameraViewModel: Error in automatic payment confirmation: {ex.Message}");
            }
        }
    }
}