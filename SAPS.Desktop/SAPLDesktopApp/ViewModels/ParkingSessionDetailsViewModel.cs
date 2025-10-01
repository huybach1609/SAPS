using ReactiveUI;
using SAPLDesktopApp.Constants;
using SAPLDesktopApp.Models;
using SAPLDesktopApp.Services;
using SAPLDesktopApp.Helpers;
using System;
using System.Globalization;
using System.Reactive;
using System.Threading.Tasks;
using System.Windows.Input;
using Avalonia.Media.Imaging;

namespace SAPLDesktopApp.ViewModels
{
    public class ParkingSessionDetailsViewModel : ViewModelBase, IRoutableViewModel
    {
        public string? UrlPathSegment => "parking-session-details";
        public IScreen HostScreen { get; }

        private ParkingSessionDetails _details;
        private bool _isLoading = false;
        private readonly IParkingSessionService _parkingSessionService;
        private readonly IFileManagementService _fileManagementService;

        // Image properties for binding
        private Bitmap? _entryFrontImage;
        private Bitmap? _entryBackImage;
        private Bitmap? _exitFrontImage;
        private Bitmap? _exitBackImage;

        public ParkingSessionDetailsViewModel(IScreen screen, ParkingSessionDetails details, IParkingSessionService? parkingSessionService = null)
        {
            HostScreen = screen;
            _details = details;
            _parkingSessionService = parkingSessionService ?? ServiceLocator.GetService<IParkingSessionService>();
            _fileManagementService = ServiceLocator.GetService<IFileManagementService>();

            BackCommand = ReactiveCommand.Create(GoBack);
            RefreshCommand = ReactiveCommand.CreateFromTask(RefreshAsync);
            ViewProfileImageCommand = ReactiveCommand.Create(ViewProfileImage);

            // Load images automatically on initialization
            _ = LoadParkingSessionImagesAsync();
        }

        public ParkingSessionDetails Details
        {
            get => _details;
            private set => this.RaiseAndSetIfChanged(ref _details, value);
        }

        public bool IsLoading
        {
            get => _isLoading;
            set => this.RaiseAndSetIfChanged(ref _isLoading, value);
        }

        // Image properties for UI binding
        public Bitmap? EntryFrontImage
        {
            get => _entryFrontImage;
            private set => this.RaiseAndSetIfChanged(ref _entryFrontImage, value);
        }

        public Bitmap? EntryBackImage
        {
            get => _entryBackImage;
            private set => this.RaiseAndSetIfChanged(ref _entryBackImage, value);
        }

        public Bitmap? ExitFrontImage
        {
            get => _exitFrontImage;
            private set => this.RaiseAndSetIfChanged(ref _exitFrontImage, value);
        }

        public Bitmap? ExitBackImage
        {
            get => _exitBackImage;
            private set => this.RaiseAndSetIfChanged(ref _exitBackImage, value);
        }

        private void GoBack()
        {
            HostScreen.Router.NavigateBack.Execute().Subscribe();
        }

        private async Task RefreshAsync()
        {
            try
            {
                IsLoading = true;
                
                // Refresh the session details from the API
                // Note: This requires the session ID to be stored in the details object
                // If not available, we could use license plate to get active session
                if (!string.IsNullOrEmpty(Details.Id))
                {
                    var refreshedDetails = await _parkingSessionService.GetParkingSessionDetailsAsync(Details.Id);
                    
                    if (refreshedDetails != null)
                    {
                        // Update the details with fresh data
                        Details = ConvertDtoToParkingSessionDetails(refreshedDetails);
                        RaiseAllPropertyChanged();
                        
                        // Reload images after refreshing details
                        await LoadParkingSessionImagesAsync();
                        
                        System.Diagnostics.Debug.WriteLine($"ParkingSessionDetailsViewModel: Refreshed details for session {Details.Id}");
                    }
                }
                else
                {
                    // Try to refresh using license plate for active sessions
                    var activeSession = await _parkingSessionService.GetParkingSessionDetailsAsync(Details.Id);
                    
                    if (activeSession != null)
                    {
                        Details = ConvertDtoToParkingSessionDetails(activeSession);
                        RaiseAllPropertyChanged();
                        
                        // Reload images after refreshing details
                        await LoadParkingSessionImagesAsync();
                        
                        System.Diagnostics.Debug.WriteLine($"ParkingSessionDetailsViewModel: Refreshed active session for {Details.LicensePlate}");
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ParkingSessionDetailsViewModel: Error refreshing details: {ex.Message}");
                // Could show a notification here if needed
            }
            finally
            {
                IsLoading = false;
            }
        }

        /// <summary>
        /// Loads all parking session images from local storage or downloads them if needed
        /// </summary>
        private async Task LoadParkingSessionImagesAsync()
        {
            if (string.IsNullOrEmpty(Details.Id))
                return;

            try
            {
                const string frontEntryFileName = "front_entry.jpg";
                const string backEntryFileName = "back_entry.jpg";
                const string frontExitFileName = "front_exit.jpg";
                const string backExitFileName = "back_exit.jpg";

                // Load or download entry images
                await LoadOrDownloadImageAsync(Details.Id, frontEntryFileName, Details.EntryFrontCaptureUrl, 
                    (image) => EntryFrontImage = image);
                
                await LoadOrDownloadImageAsync(Details.Id, backEntryFileName, Details.EntryBackCaptureUrl, 
                    (image) => EntryBackImage = image);

                // Load or download exit images (if available)
                if (!string.IsNullOrEmpty(Details.ExitFrontCaptureUrl))
                {
                    await LoadOrDownloadImageAsync(Details.Id, frontExitFileName, Details.ExitFrontCaptureUrl, 
                        (image) => ExitFrontImage = image);
                }

                if (!string.IsNullOrEmpty(Details.ExitBackCaptureUrl))
                {
                    await LoadOrDownloadImageAsync(Details.Id, backExitFileName, Details.ExitBackCaptureUrl, 
                        (image) => ExitBackImage = image);
                }

                System.Diagnostics.Debug.WriteLine($"ParkingSessionDetailsViewModel: Loaded parking session images for session {Details.Id}");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ParkingSessionDetailsViewModel: Error loading parking session images: {ex.Message}");
            }
        }

        /// <summary>
        /// Loads an image from local storage or downloads it if not available
        /// </summary>
        private async Task LoadOrDownloadImageAsync(string sessionId, string fileName, string downloadUrl, Action<Bitmap?> setImage)
        {
            try
            {
                // Check if the image exists locally
                if (_fileManagementService.DoesParkingSessionFileExist(sessionId, fileName))
                {
                    // Load from local storage
                    var image = await _fileManagementService.LoadParkingSessionImageAsync(sessionId, fileName);
                    setImage(image);
                }
                else if (!string.IsNullOrEmpty(downloadUrl))
                {
                    // Download the image first
                    await _fileManagementService.DownloadParkingSessionFileAsync(downloadUrl, sessionId, fileName);
                    
                    // Then load the downloaded image
                    var image = await _fileManagementService.LoadParkingSessionImageAsync(sessionId, fileName);
                    setImage(image);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ParkingSessionDetailsViewModel: Error loading/downloading image {fileName}: {ex.Message}");
            }
        }

        public ICommand BackCommand { get; }
        public ICommand RefreshCommand { get; }
        public ICommand ViewProfileImageCommand { get; }

        // UI convenience properties for binding
        public string LicensePlate => Details.LicensePlate;
        public string OwnerFullName => Details.Owner?.FullName ?? Resources.TextResource.UnknownOwnerName;
        public string OwnerPhoneNumber => Details.Owner?.PhoneNumber ?? Resources.TextResource.NotProvidedText;
        public string VehicleColor => Details.Vehicle?.Color ?? Resources.TextResource.UnknownText;
        public string VehicleBrand => Details.Vehicle?.Brand ?? Resources.TextResource.UnknownText;
        public string VehicleModelCode => Details.Vehicle?.Model ?? Resources.TextResource.UnknownText;
        public string Status => ParkingSessionLocalizationHelper.GetLocalizedStatus(Details.Status);
        public string PaymentStatus => ParkingSessionLocalizationHelper.GetLocalizedPaymentStatus(Details.PaymentStatus);
        public string PaymentMethod => Details.PaymentMethod;
        public string EntryFrontCaptureUrl => Details.EntryFrontCaptureUrl;
        public string EntryBackCaptureUrl => Details.EntryBackCaptureUrl;
        public string ExitFrontCaptureUrl => Details.ExitFrontCaptureUrl ?? "";
        public string ExitBackCaptureUrl => Details.ExitBackCaptureUrl ?? "";
        public decimal Fee => Details.Cost;

        public string FormattedEntryTime => Details.EntryTime;
        public string FormattedExitTime => Details.ExitTime;
        public string FormattedDuration => Details.Duration;
        public string FormattedFee => Details.Fee;

        public bool HasExitImages => !string.IsNullOrEmpty(ExitFrontCaptureUrl) || !string.IsNullOrEmpty(ExitBackCaptureUrl);
        public bool IsActiveSession => Status == ParkingSessionStatus.Parking.ToString();

        // Image availability properties for UI binding
        public bool HasEntryFrontImage => EntryFrontImage != null;
        public bool HasEntryBackImage => EntryBackImage != null;
        public bool HasExitFrontImage => ExitFrontImage != null;
        public bool HasExitBackImage => ExitBackImage != null;

        private void ViewProfileImage()
        {
            // TODO: Implement profile image viewing
            // This could open a dialog or navigate to an image view
        }

        private ParkingSessionDetails ConvertDtoToParkingSessionDetails(
            DTOs.Concrete.ParkingSessionDtos.ParkingSessionDetailsForParkingLotDto dto)
        {
            return new ParkingSessionDetails
            {
                Id = dto.Id,
                LicensePlate = dto.Vehicle?.LicensePlate ?? Details.LicensePlate,
                EntryDateTime = dto.EntryDateTime,
                ExitDateTime = dto.ExitDateTime,
                Cost = dto.Cost,
                Status = dto.Status,
                PaymentStatus = dto.PaymentStatus,
                PaymentMethod = dto.PaymentMethod ?? Resources.TextResource.UnknownText,
                EntryFrontCaptureUrl = dto.EntryFrontCaptureUrl,
                EntryBackCaptureUrl = dto.EntryBackCaptureUrl,
                ExitFrontCaptureUrl = dto.ExitFrontCaptureUrl,
                ExitBackCaptureUrl = dto.ExitBackCaptureUrl,
                Vehicle = dto.Vehicle != null ? new VehicleSummary 
                {
                    LicensePlate = dto.Vehicle.LicensePlate ?? Details.LicensePlate,
                    Brand = dto.Vehicle.Brand ?? Resources.TextResource.UnknownText,
                    Model = dto.Vehicle.Model ?? Resources.TextResource.UnknownText,
                    Color = dto.Vehicle.Color ?? Resources.TextResource.UnknownText,
                    Status = dto.Vehicle.Status ?? Resources.TextResource.UnknownText
                } : new VehicleSummary { LicensePlate = Details.LicensePlate },
                Owner = dto.Owner != null ? new ClientSummary 
                { 
                    FullName = dto.Owner.FullName ?? Resources.TextResource.UnknownOwnerName, 
                    PhoneNumber = dto.Owner.PhoneNumber ?? Resources.TextResource.NotProvidedText
                } : new ClientSummary { FullName = Resources.TextResource.UnknownOwnerName, PhoneNumber = Resources.TextResource.NotProvidedText }
            };
        }

        private void RaiseAllPropertyChanged()
        {
            this.RaisePropertyChanged(nameof(LicensePlate));
            this.RaisePropertyChanged(nameof(OwnerFullName));
            this.RaisePropertyChanged(nameof(OwnerPhoneNumber));
            this.RaisePropertyChanged(nameof(VehicleColor));
            this.RaisePropertyChanged(nameof(VehicleBrand));
            this.RaisePropertyChanged(nameof(VehicleModelCode));
            this.RaisePropertyChanged(nameof(Status));
            this.RaisePropertyChanged(nameof(PaymentStatus));
            this.RaisePropertyChanged(nameof(PaymentMethod));
            this.RaisePropertyChanged(nameof(EntryFrontCaptureUrl));
            this.RaisePropertyChanged(nameof(EntryBackCaptureUrl));
            this.RaisePropertyChanged(nameof(ExitFrontCaptureUrl));
            this.RaisePropertyChanged(nameof(ExitBackCaptureUrl));
            this.RaisePropertyChanged(nameof(Fee));
            this.RaisePropertyChanged(nameof(FormattedEntryTime));
            this.RaisePropertyChanged(nameof(FormattedExitTime));
            this.RaisePropertyChanged(nameof(FormattedDuration));
            this.RaisePropertyChanged(nameof(FormattedFee));
            this.RaisePropertyChanged(nameof(HasExitImages));
            this.RaisePropertyChanged(nameof(IsActiveSession));
            this.RaisePropertyChanged(nameof(HasEntryFrontImage));
            this.RaisePropertyChanged(nameof(HasEntryBackImage));
            this.RaisePropertyChanged(nameof(HasExitFrontImage));
            this.RaisePropertyChanged(nameof(HasExitBackImage));
        }
    }
}