using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.ApplicationLifetimes;
using Microsoft.Extensions.DependencyInjection;
using ReactiveUI;
using SAPLDesktopApp.Constants;
using SAPLDesktopApp.Controls;
using SAPLDesktopApp.DTOs.Concrete.ParkingSessionDtos;
using SAPLDesktopApp.Models;
using SAPLDesktopApp.Resources;
using SAPLDesktopApp.Services;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Reactive;
using System.Reactive.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SAPLDesktopApp.ViewModels
{
    public class MainWindowViewModel : ViewModelBase, IScreen
    {
        public RoutingState Router { get; }
        private const string PAGE_CAMERA = "camera";
        private const string PAGE_PARKING_SESSIONS = "parkingSessions";
        private const string PAGE_SHIFT_DIARIES = "shiftDiaries";
        private const string PAGE_INCIDENCE_REPORT = "incidenceReports";
        private const string PAGE_SETTINGS = "settings";

        private string _userName = "N/A";
        private string _userRole = "N/A";
        private string _welcomeMessage = "N/A";
        private string _currentPage = PAGE_CAMERA;
        private readonly double _sidebarWidthValue;
        private IRoutableViewModel _currentView = null!;
        private bool _isSidebarOpen = true;
        private GridLength _sidebarWidth;

        // Add services for camera management and parking session processing
        private readonly ICameraService _cameraService = null!;
        private readonly IVehicleService _vehicleService = null!;
        private readonly ICameraSettingsService _cameraSettingsService = null!;
        private readonly IAuthenticationService _authenticationService;
        private readonly IParkingSessionService _parkingSessionService;
        private readonly INotificationService _notificationService;
        private CameraAssignments? _cameraAssignments;

        // User and token information
        private readonly LoggedInUser _currentUser;
        private readonly AuthenticationToken _currentToken;

        // Event for window closing
        public event Action? RequestClose;

        // License plate processing properties
        private bool _isProcessingLicensePlate = false;
        private DateTime _lastCheckInAttempt = DateTime.MinValue;
        private DateTime _lastCheckOutAttempt = DateTime.MinValue;
        private const int PROCESSING_COOLDOWN_MS = 5000; // 5 seconds cooldown between attempts

        public string UserName
        {
            get => _userName;
            set => this.RaiseAndSetIfChanged(ref _userName, value);
        }

        public string UserRole
        {
            get => _userRole;
            set => this.RaiseAndSetIfChanged(ref _userRole, value);
        }

        public string WelcomeMessage
        {
            get => _welcomeMessage;
            set => this.RaiseAndSetIfChanged(ref _welcomeMessage, value);
        }

        public string CurrentPage
        {
            get => _currentPage;
            set => this.RaiseAndSetIfChanged(ref _currentPage, value);
        }

        public IRoutableViewModel CurrentView
        {
            get => _currentView;
            set => this.RaiseAndSetIfChanged(ref _currentView, value);
        }

        public GridLength SidebarWidth
        {
            get => _sidebarWidth;
            set => this.RaiseAndSetIfChanged(ref _sidebarWidth, value);
        }

        public bool IsSidebarOpen
        {
            get => _isSidebarOpen;
            set
            {
                this.RaiseAndSetIfChanged(ref _isSidebarOpen, value);
                if (value)
                {
                    SidebarWidth = new GridLength(_sidebarWidthValue, GridUnitType.Pixel);
                }
                else
                {
                    SidebarWidth = new GridLength(0, GridUnitType.Pixel);
                }
            }
        }

        // Access to user and token information
        public LoggedInUser CurrentUser => _currentUser;
        public AuthenticationToken CurrentToken => _currentToken;
        public string? AccessToken => _currentToken?.AccessToken;
        public string? AuthorizationHeader => _currentToken?.AuthorizationHeader;

        // Navigation Items Collection
        public ObservableCollection<NavigationItem> NavigationItems { get; }

        public ReactiveCommand<string, Unit> NavigateCommand { get; }
        public ReactiveCommand<NavigationItem, Unit> NavigateToItemCommand { get; }
        public ReactiveCommand<Unit, Unit> LogoutCommand { get; }
        public ReactiveCommand<Unit, Unit> ToggleSidebarCommand { get; }

        // Constructor with authentication information
        public MainWindowViewModel(LoggedInUser currentUser, AuthenticationToken currentToken)
        {
            _currentUser = currentUser ?? throw new ArgumentNullException(nameof(currentUser));
            _currentToken = currentToken ?? throw new ArgumentNullException(nameof(currentToken));

            Router = new RoutingState();

            // Get services from ServiceLocator
            _cameraService = ServiceLocator.GetService<ICameraService>();
            _cameraSettingsService = ServiceLocator.GetService<ICameraSettingsService>();

            // Subscribe to camera settings changes
            if (_cameraSettingsService != null)
            {
                _cameraSettingsService.CameraAssignmentsChanged += OnCameraAssignmentsChanged;
            }

            _authenticationService = ServiceLocator.GetService<IAuthenticationService>();
            _vehicleService = ServiceLocator.GetService<IVehicleService>();
            _parkingSessionService = ServiceLocator.GetService<IParkingSessionService>();
            _notificationService = ServiceLocator.GetService<INotificationService>();

            // Initialize user information
            InitializeUserInformation();

            // Cache all resource values once during initialization
            var app = Application.Current;
            _sidebarWidthValue = app?.FindResource("SidebarWidth") as double? ?? 350;
            SidebarWidth = new GridLength(_sidebarWidthValue, GridUnitType.Pixel);

            // Initialize navigation items
            NavigationItems = new ObservableCollection<NavigationItem>();

            NavigateCommand = ReactiveCommand.Create<string, Unit>(
                destination => Navigate(destination));

            NavigateToItemCommand = ReactiveCommand.Create<NavigationItem, Unit>(
                item => NavigateToItem(item));

            LogoutCommand = ReactiveCommand.CreateFromTask(LogoutAsync);
            ToggleSidebarCommand = ReactiveCommand.Create(ToggleSidebar);

            // Initialize navigation items
            InitializeNavigationItems();

            // Force camera cleanup and re-initialization for fresh login
            if (_cameraService != null)
            {
                System.Diagnostics.Debug.WriteLine("MainWindowViewModel: Cleaning up any existing camera state...");
                _cameraService.ReleaseAllCameras();
            }

            // Initialize cameras at application level and set up license plate processing
            _ = Task.Run(InitializeCamerasAsync);

            // Navigate to Camera view initially
            CurrentView = CreateViewModel(PAGE_CAMERA);
            Router.Navigate.Execute(CurrentView).Subscribe();

            // Set initial selection
            if (NavigationItems.Any())
            {
                NavigationItems[0].IsSelected = true;
            }
        }

        // Parameterless constructor for design-time support
        public MainWindowViewModel() : this(
            new LoggedInUser
            {
                Id = "design-user",
                Email = "design@example.com",
                FullName = "Design User",
                Role = "Staff",
                Phone = "",
                JwtId = "design-jwt"
            },
            new AuthenticationToken
            {
                AccessToken = "design-token",
                RefreshToken = "design-refresh",
                TokenType = "Bearer",
                ExpiresAt = DateTime.UtcNow.AddHours(1)
            })
        {
        }

        private void InitializeUserInformation()
        {
            UserName = _currentUser.FullName;
            UserRole = _currentUser.LocalizedRole; // Use localized role instead of raw role

            // Create a personalized welcome message
            var timeOfDay = GetTimeOfDayGreeting();
            WelcomeMessage = string.Format(Resources.TextResource.WelcomeUserMessage, timeOfDay, _currentUser.FullName);

            // Log user information for debugging
            System.Diagnostics.Debug.WriteLine($"MainWindowViewModel: User logged in - {_currentUser.FullName} ({_currentUser.Role})");
            if (_currentUser.IsStaff && _currentUser.HasParkingLot)
            {
                System.Diagnostics.Debug.WriteLine($"MainWindowViewModel: Parking Lot ID - {_currentUser.ParkingLotId}");
            }
            System.Diagnostics.Debug.WriteLine($"MainWindowViewModel: Token expires at - {_currentToken.ExpiresAt}");
        }

        private static string GetTimeOfDayGreeting()
        {
            var hour = DateTime.Now.Hour;
            return hour switch
            {
                >= 5 and < 12 => Resources.TextResource.GreetingGoodMorning,
                >= 12 and < 17 => Resources.TextResource.GreetingGoodAfternoon,
                >= 17 and < 22 => Resources.TextResource.GreetingGoodEvening,
                _ => Resources.TextResource.GreetingGoodEvening
            };
        }

        /// <summary>
        /// Initialize cameras at application level to keep them running throughout the app lifecycle
        /// </summary>
        private async Task InitializeCamerasAsync()
        {
            try
            {
                System.Diagnostics.Debug.WriteLine("MainWindowViewModel: Starting camera initialization...");

                // Ensure we have the camera service
                if (_cameraService == null)
                {
                    System.Diagnostics.Debug.WriteLine("MainWindowViewModel: Camera service is null, cannot initialize cameras");
                    return;
                }

                // Always cleanup existing cameras first (important for fresh login)
                System.Diagnostics.Debug.WriteLine("MainWindowViewModel: Releasing all existing cameras...");
                _cameraService.ReleaseAllCameras();

                // Load camera assignments
                if (_cameraSettingsService != null)
                {
                    _cameraAssignments = await _cameraSettingsService.LoadCameraAssignmentsAsync();
                    System.Diagnostics.Debug.WriteLine($"MainWindowViewModel: Loaded camera assignments - Front Entrance: {_cameraAssignments.FrontEntranceCameraIndex}, Back Entrance: {_cameraAssignments.BackEntranceCameraIndex}, Front Exit: {_cameraAssignments.FrontExitCameraIndex}, Back Exit: {_cameraAssignments.BackExitCameraIndex}");
                }
                else
                {
                    System.Diagnostics.Debug.WriteLine("MainWindowViewModel: Camera settings service is null, using empty assignments");
                    _cameraAssignments = new CameraAssignments();
                }

                // Start assigned cameras
                await StartAssignedCamerasAsync(_cameraAssignments);

                // Subscribe to license plate detection events for automatic processing
                _cameraService.LicensePlateDetected -= OnLicensePlateDetectedForProcessing; // Remove any existing subscription
                _cameraService.LicensePlateDetected += OnLicensePlateDetectedForProcessing;

                System.Diagnostics.Debug.WriteLine("MainWindowViewModel: Cameras initialized successfully");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"MainWindowViewModel: Error initializing cameras: {ex.Message}");
            }
        }

        /// <summary>
        /// Start cameras based on assignments and keep them running
        /// </summary>
        private async Task StartAssignedCamerasAsync(CameraAssignments assignments)
        {
            if (assignments == null) return;

            var cameraIndices = new[]
            {
                assignments.FrontEntranceCameraIndex,
                assignments.BackEntranceCameraIndex,
                assignments.FrontExitCameraIndex,
                assignments.BackExitCameraIndex
            };

            foreach (var cameraIndex in cameraIndices.Where(index => index.HasValue))
            {
                if (cameraIndex.HasValue)
                {
                    await Task.Run(() =>
                    {
                        if (_cameraService.Initialize(cameraIndex.Value))
                        {
                            _cameraService.Start(cameraIndex.Value);
                            // Set recognition interval for all cameras (license plate recognition is always enabled)
                            _cameraService.SetLicensePlateRecognitionInterval(cameraIndex.Value, 5000);
                            System.Diagnostics.Debug.WriteLine($"MainWindowViewModel: Camera {cameraIndex.Value} started and processing");
                        }
                        else
                        {
                            System.Diagnostics.Debug.WriteLine($"MainWindowViewModel: Failed to initialize camera {cameraIndex.Value}");
                        }
                    });
                }
            }
        }

        /// <summary>
        /// Handle license plate detection for automatic check-in/check-out processing
        /// </summary>
        private async void OnLicensePlateDetectedForProcessing(int cameraIndex, string licensePlate, float confidence)
        {
            // Avoid processing if already processing another plate or if on cooldown
            if (_isProcessingLicensePlate)
                return;

            try
            {
                if (_cameraAssignments == null)
                    return;

                bool isEntranceCamera = _cameraAssignments.FrontEntranceCameraIndex == cameraIndex ||
                                       _cameraAssignments.BackEntranceCameraIndex == cameraIndex;

                bool isExitCamera = _cameraAssignments.FrontExitCameraIndex == cameraIndex ||
                                   _cameraAssignments.BackExitCameraIndex == cameraIndex;

                if (isEntranceCamera && _cameraService.IsDetectingEntrance())
                {
                    // Check cooldown for check-in attempts  
                    var timeSinceLastCheckIn = DateTime.UtcNow - _lastCheckInAttempt;
                    if (timeSinceLastCheckIn.TotalMilliseconds < PROCESSING_COOLDOWN_MS)
                        return;

                    _lastCheckInAttempt = DateTime.UtcNow;
                    await ProcessAutomaticCheckIn(cameraIndex, licensePlate, confidence);
                }
                else if (isExitCamera && _cameraService.IsDetectingExit())
                {
                    // Check cooldown for check-out attempts
                    var timeSinceLastCheckOut = DateTime.UtcNow - _lastCheckOutAttempt;
                    if (timeSinceLastCheckOut.TotalMilliseconds < PROCESSING_COOLDOWN_MS)
                        return;

                    _lastCheckOutAttempt = DateTime.UtcNow;
                    await ProcessAutomaticCheckOut(cameraIndex, licensePlate, confidence);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"MainWindowViewModel: Error in license plate processing: {ex.Message}");
            }
        }

        /// <summary>
        /// Process automatic check-in when license plate is detected at entrance
        /// </summary>
        private async Task ProcessAutomaticCheckIn(int cameraIndex, string licensePlate, float confidence)
        {
            try
            {
                _isProcessingLicensePlate = true;

                // Check if license plate is valid (not empty or null)
                if (string.IsNullOrWhiteSpace(licensePlate))
                {
                    await HandleLicensePlateProcessingError(CameraViewModelSideBarMode.CheckIn,
                        Resources.TextResource.ErrorLicensePlateNotReadable);
                    return;
                }

                // Check if vehicle is already checked in
                var existingSession = await _parkingSessionService.GetActiveSessionDetailsAsync(AuthenticationState.CurrentUser!.ParkingLotId!, licensePlate);
                if (existingSession != null && existingSession.Status == ParkingSessionStatus.Parking.ToString())
                {
                    await _notificationService.ShowWarningNotificationAsync(Resources.TextResource.NotificationTitleAlreadyCheckedIn,
                        new StringBuilder().Append(licensePlate)
                        .Append(Resources.TextResource.NotificationMessageVehicleAlreadyCheckedIn)
                        .Append(existingSession.EntryDateTime)
                        .ToString());
                    return;
                }

                var vehicleDetails = await _vehicleService.GetVehicleByLicensePlateAsync(licensePlate);
                if (vehicleDetails == null)
                {
                    await _notificationService.ShowWarningNotificationAsync(Resources.TextResource.NotificationVehicleNotFoundTitle,
                        string.Format(Resources.TextResource.NotificationVehicleNotFoundMessage, licensePlate));
                    return;
                }

                    // Capture images for check-in
                var frontImage = await _cameraService.CaptureFrameAsync(_cameraAssignments!.FrontEntranceCameraIndex ?? cameraIndex);
                var backImage = await _cameraService.CaptureFrameAsync(_cameraAssignments!.BackEntranceCameraIndex ?? cameraIndex);

                // Prepare check-in request
                var checkInRequest = new CheckInParkingSessionRequest
                {
                    VehicleLicensePlate = licensePlate,
                    ParkingLotId = _currentUser.ParkingLotId ?? string.Empty,
                    EntryFrontCapture = ParkingSessionService.BitmapToByteArray(frontImage),
                    EntryBackCapture = ParkingSessionService.BitmapToByteArray(backImage)
                };

                // Perform check-in
                await _parkingSessionService.CheckInAsync(checkInRequest);

                // Show success notification
                await _notificationService.ShowCheckInNotificationAsync(licensePlate,
                    string.Format(Resources.TextResource.AutomaticCheckInSuccessMessage, cameraIndex));

                System.Diagnostics.Debug.WriteLine($"MainWindowViewModel: Automatic check-in successful for {licensePlate}");
            }
            catch (Exception ex)
            {
                _cameraService.SetIsDetectingEntrance(false); // Stop further automatic attempts on error
                System.Diagnostics.Debug.WriteLine($"MainWindowViewModel: Automatic check-in failed for {licensePlate}: {ex.Message}");
                await HandleLicensePlateProcessingError(CameraViewModelSideBarMode.CheckIn,
                    string.Format(Resources.TextResource.ErrorFailedToCheckInVehicle, licensePlate));
            }
            finally
            {
                _isProcessingLicensePlate = false;
            }
        }

        /// <summary>
        /// Process automatic check-out when license plate is detected at exit
        /// </summary>
        private async Task ProcessAutomaticCheckOut(int cameraIndex, string licensePlate, float confidence)
        {
            try
            {
                _isProcessingLicensePlate = true;

                // Check if license plate is valid (not empty or null)
                if (string.IsNullOrWhiteSpace(licensePlate))
                {
                    await HandleLicensePlateProcessingError(CameraViewModelSideBarMode.CheckOut,
                        Resources.TextResource.ErrorLicensePlateNotReadable);
                    return;
                }

                // Check if vehicle is currently checked in
                var activeSession = await _parkingSessionService.GetActiveSessionDetailsAsync(AuthenticationState.CurrentUser!.ParkingLotId!, licensePlate);
                
                if (activeSession == null || activeSession.Status != ParkingSessionStatus.Parking.ToString())
                {
                    await HandleLicensePlateProcessingError(CameraViewModelSideBarMode.CheckOut,
                        string.Format(Resources.TextResource.ErrorVehicleNotCurrentlyCheckedIn, licensePlate));
                    return;
                }

                // Capture images for check-out
                var frontImage = await _cameraService.CaptureFrameAsync(_cameraAssignments!.FrontExitCameraIndex ?? cameraIndex);
                var backImage = await _cameraService.CaptureFrameAsync(_cameraAssignments!.BackExitCameraIndex ?? cameraIndex);

                // Prepare check-out request
                var checkOutRequest = new FinishParkingSessionRequest
                {
                    VehicleLicensePlate = licensePlate,
                    ParkingLotId = _currentUser.ParkingLotId ?? "",
                    ExitFrontCapture = ParkingSessionService.BitmapToByteArray(frontImage),
                    ExitBackCapture = ParkingSessionService.BitmapToByteArray(backImage)
                };

                // Perform check-out
                await _parkingSessionService.AutomaticallyCheckOutAsync(checkOutRequest);

                // Show success notification
                await _notificationService.ShowCheckOutNotificationAsync(licensePlate,
                    string.Format(Resources.TextResource.AutomaticCheckOutSuccessMessage, cameraIndex, 
                    activeSession.Cost.ToString("C", Resources.TextResource.Culture)));

                System.Diagnostics.Debug.WriteLine($"MainWindowViewModel: Automatic check-out successful for {licensePlate}");
            }
            catch (Exception ex)
            {
                _cameraService.SetIsDetectingExit(false); // Stop further automatic attempts on error
                System.Diagnostics.Debug.WriteLine($"MainWindowViewModel: Automatic check-out failed for {licensePlate}: {ex.Message}");
                await HandleLicensePlateProcessingError(CameraViewModelSideBarMode.CheckOut,
                    string.Format(Resources.TextResource.ErrorFailedToCheckOutVehicle, licensePlate));
            }
            finally
            {
                _isProcessingLicensePlate = false;
            }
        }

        /// <summary>
        /// Handle errors in license plate processing by redirecting to camera view with sidebar
        /// </summary>
        private async Task HandleLicensePlateProcessingError(CameraViewModelSideBarMode mode, string errorMessage)
        {
            try
            {
                // Show warning notification
                await _notificationService.ShowWarningNotificationAsync(Resources.TextResource.ManualProcessingRequiredTitle, errorMessage);

                // Navigate to camera view if not already there
                if (CurrentPage != PAGE_CAMERA)
                {
                    Navigate(PAGE_CAMERA);

                    // Wait a bit for navigation to complete
                    await Task.Delay(100);
                }

                // Open the sidebar with appropriate mode
                if (CurrentView is CameraViewModel cameraViewModel)
                {
                    if (mode == CameraViewModelSideBarMode.CheckIn)
                    {
                        await cameraViewModel.OpenCheckInSidebarAsync();
                    }
                    else if (mode == CameraViewModelSideBarMode.CheckOut)
                    {
                        await cameraViewModel.OpenCheckOutSidebarAsync();
                    }
                }

                System.Diagnostics.Debug.WriteLine($"MainWindowViewModel: Redirected to manual processing due to: {errorMessage}");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"MainWindowViewModel: Error handling license plate processing error: {ex.Message}");
            }
        }

        /// <summary>
        /// Dispose cameras when the application closes
        /// </summary>
        public void Dispose()
        {
            try
            {
                // Unsubscribe from events
                if (_cameraService != null)
                {
                    _cameraService.LicensePlateDetected -= OnLicensePlateDetectedForProcessing;
                }

                System.Diagnostics.Debug.WriteLine("MainWindowViewModel: Disposing cameras...");
                _cameraService?.Dispose();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"MainWindowViewModel: Error disposing cameras: {ex.Message}");
            }
        }

        private void InitializeNavigationItems()
        {
            NavigationItems.Clear();

            var items = new[]
            {
                new NavigationItem
                {
                    Id = PAGE_CAMERA,
                    Title = TextResource.NavCameraTitle,
                    Icon = Application.Current?.FindResource(StringKeys.CAMERA_ICON) as string ?? string.Empty,
                    IsEnabled = true,
                    IsVisible = true,
                    NavigateCommand = NavigateToItemCommand
                },
                new NavigationItem
                {
                    Id = PAGE_PARKING_SESSIONS,
                    Title = TextResource.NavParkingSessionsTitle,
                    Icon = Application.Current?.FindResource(StringKeys.PARKING_SESSION_ICON) as string ?? string.Empty,
                    IsEnabled = true,
                    IsVisible = true,
                    NavigateCommand = NavigateToItemCommand
                },
                new NavigationItem
                {
                    Id = PAGE_SHIFT_DIARIES,
                    Title = TextResource.NavShiftDiariesTitle,
                    Icon = Application.Current?.FindResource(StringKeys.SHIFT_DIARY_ICON) as string ?? string.Empty,
                    IsEnabled = true,
                    IsVisible = true,
                    NavigateCommand = NavigateToItemCommand
                },
                new NavigationItem
                {
                    Id = PAGE_INCIDENCE_REPORT,
                    Title = TextResource.NavIncidenceReportsTitle,
                    Icon = Application.Current?.FindResource(StringKeys.INCIDENCE_REPORT_ICON) as string ?? string.Empty,
                    IsEnabled = true,
                    IsVisible = true,
                    NavigateCommand = NavigateToItemCommand
                },
                new NavigationItem
                {
                    Id = PAGE_SETTINGS,
                    Title = Resources.TextResource.BtnSettings,
                    Icon = "⚙️",
                    IsEnabled = true,
                    IsVisible = true,
                    NavigateCommand = NavigateToItemCommand
                }
            };

            foreach (var item in items)
            {
                NavigationItems.Add(item);
            }
        }

        private Unit NavigateToItem(NavigationItem item)
        {
            if (item == null || !item.IsEnabled) return Unit.Default;

            // Update selection
            foreach (var navItem in NavigationItems)
            {
                navItem.IsSelected = navItem.Id == item.Id;
            }

            // Navigate
            return Navigate(item.Id);
        }

        private Unit Navigate(string destination)
        {
            CurrentPage = destination;
            CurrentView = CreateViewModel(destination);
            Router.Navigate.Execute(CurrentView);

            // Update navigation selection if navigating via string
            var item = NavigationItems.FirstOrDefault(x => x.Id == destination);
            if (item != null)
            {
                foreach (var navItem in NavigationItems)
                {
                    navItem.IsSelected = navItem.Id == destination;
                }
            }

            return Unit.Default;
        }

        private IRoutableViewModel CreateViewModel(string destination)
        {
            // Create ViewModels with IScreen (this) and required services from ServiceLocator
            return destination switch
            {
                var page when page == PAGE_CAMERA => new CameraViewModel(
                    this, // Pass IScreen (MainWindowViewModel implements IScreen)
                    ServiceLocator.GetService<INotificationService>(),
                    ServiceLocator.GetService<ICameraService>()),
                var page when page == PAGE_INCIDENCE_REPORT => ActivatorUtilities.CreateInstance<IncidenceReportsViewModel>(
                        ServiceLocator.ServiceProvider,
                        this
                    ),
                var page when page == PAGE_SHIFT_DIARIES => ActivatorUtilities.CreateInstance<ShiftDiariesViewModel>(
                        ServiceLocator.ServiceProvider,
                        this
                    ),
                var page when page == PAGE_SETTINGS => ActivatorUtilities.CreateInstance<SettingsViewModel>(
                        ServiceLocator.ServiceProvider,
                        this
                    ),
                var page when page == PAGE_PARKING_SESSIONS => new ParkingSessionsViewModel(this),
                _ => throw new NotImplementedException(string.Format(Resources.TextResource.ErrorUnknownPage, destination)),
            };
        }

        private void ToggleSidebar()
        {
            IsSidebarOpen = !IsSidebarOpen;
        }

        private async Task LogoutAsync()
        {
            try
            {
                // Call the authentication service to logout
                await _authenticationService.LogoutAsync();

                System.Diagnostics.Debug.WriteLine("MainWindowViewModel: User logged out successfully");

                // Create and show login window
                var loginWindow = new SAPLDesktopApp.Views.LoginWindow
                {
                    DataContext = new LoginViewModel()
                };

                if (Application.Current?.ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
                {
                    desktop.MainWindow = loginWindow;
                    loginWindow.Show();

                    System.Diagnostics.Debug.WriteLine("LoginViewModel: MainWindow set as application main window");
                }
                // Close current main window by raising the RequestClose event
                RequestClose?.Invoke();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"MainWindowViewModel: Error during logout: {ex.Message}");
                // Even if logout API call fails, we should still redirect to login
                var loginWindow = new SAPLDesktopApp.Views.LoginWindow
                {
                    DataContext = new LoginViewModel()
                };

                loginWindow.Show();

                // Close current main window even on error
                RequestClose?.Invoke();
            }
        }

        // Method to dynamically add navigation items
        public void AddNavigationItem(NavigationItem item)
        {
            item.NavigateCommand = NavigateToItemCommand;
            NavigationItems.Add(item);
        }

        // Method to remove navigation items
        public void RemoveNavigationItem(string id)
        {
            var item = NavigationItems.FirstOrDefault(x => x.Id == id);
            if (item != null)
            {
                NavigationItems.Remove(item);
            }
        }

        // Method to enable/disable navigation items
        public void SetNavigationItemEnabled(string id, bool enabled)
        {
            var item = NavigationItems.FirstOrDefault(x => x.Id == id);
            if (item != null)
            {
                item.IsEnabled = enabled;
            }
        }

        // Method to show/hide navigation items
        public void SetNavigationItemVisible(string id, bool visible)
        {
            var item = NavigationItems.FirstOrDefault(x => x.Id == id);
            if (item != null)
            {
                item.IsVisible = visible;
            }
        }

        private async void OnCameraAssignmentsChanged(CameraAssignments newAssignments)
        {
            try
            {
                System.Diagnostics.Debug.WriteLine("MainWindowViewModel: Camera assignments changed, restarting cameras...");

                // Stop current cameras and unsubscribe from old events
                _cameraService.ReleaseAllCameras();
                if (_cameraService != null)
                {
                    _cameraService.LicensePlateDetected -= OnLicensePlateDetectedForProcessing;
                }

                // Update the assignments
                _cameraAssignments = newAssignments;

                // Restart cameras with new assignments
                await StartAssignedCamerasAsync(_cameraAssignments);

                // Re-subscribe to license plate detection events
                _cameraService!.LicensePlateDetected += OnLicensePlateDetectedForProcessing;

                // Show notification that settings were applied
                await _notificationService.ShowInfoNotificationAsync(Resources.TextResource.CameraSettingsAppliedTitle,
                    Resources.TextResource.CameraSettingsAppliedMessage);

                System.Diagnostics.Debug.WriteLine("MainWindowViewModel: Cameras restarted with new assignments");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"MainWindowViewModel: Error applying camera settings: {ex.Message}");

                // Show error notification
                await _notificationService.ShowErrorNotificationAsync(Resources.TextResource.CameraSettingsErrorTitle,
                    Resources.TextResource.CameraSettingsErrorMessage);
            }
        }

        // Method to trigger application restart
        public void RequestApplicationRestart()
        {
            if (Avalonia.Application.Current?.ApplicationLifetime is Avalonia.Controls.ApplicationLifetimes.IClassicDesktopStyleApplicationLifetime desktop)
            {
                if (AuthenticationState.CurrentUser != null && AuthenticationState.CurrentToken != null)
                {
                    // Create and show main window with current authentication state
                    var mainWindow = new SAPLDesktopApp.Views.MainWindow
                    {
                        DataContext = new MainWindowViewModel(AuthenticationState.CurrentUser, AuthenticationState.CurrentToken)
                    };
                    desktop.MainWindow = mainWindow;
                }
                else
                {
                    desktop.MainWindow = new SAPLDesktopApp.Views.LoginWindow
                    {
                        DataContext = new SAPLDesktopApp.ViewModels.LoginViewModel()
                    };
                }
                desktop.MainWindow.Show();
            }
            RequestClose?.Invoke();
        }
    }
}