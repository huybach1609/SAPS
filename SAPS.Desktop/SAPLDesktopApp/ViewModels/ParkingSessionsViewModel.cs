using Avalonia;
using Avalonia.Controls;
using ReactiveUI;
using SAPLDesktopApp.Constants;
using SAPLDesktopApp.DTOs.Concrete.ParkingSessionDtos;
using SAPLDesktopApp.Models;
using SAPLDesktopApp.Services;
using SAPLDesktopApp.Helpers;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Reactive;
using System.Reactive.Linq;
using System.Threading.Tasks;

namespace SAPLDesktopApp.ViewModels
{
    public class ParkingSessionsViewModel : ViewModelBase, IRoutableViewModel
    {
        // Navigation properties
        public string? UrlPathSegment { get; }
        public IScreen HostScreen { get; }

        // Search and filtering
        private string _searchText = string.Empty;
        private string _resultSummary = string.Empty;
        private string _selectedFilter = Resources.TextResource.FilterAllOption;
        private bool _isLoading = false;

        // Data collections - unified parking session model
        private readonly ObservableCollection<ParkingSessionItem> _allParkingSessions;
        private ObservableCollection<ParkingSessionItem> _filteredData;

        // Filter options
        private ObservableCollection<string> _filterOptions;

        // Services
        private readonly IParkingSessionService _parkingSessionService;
        private readonly INotificationService _notificationService;

        public ParkingSessionsViewModel(IScreen screen, IParkingSessionService? parkingSessionService = null)
        {
            HostScreen = screen;
            UrlPathSegment = Application.Current?.FindResource("PageVehicles") as string ?? "parking";

            _parkingSessionService = parkingSessionService ?? ServiceLocator.GetService<IParkingSessionService>();
            _notificationService = ServiceLocator.GetService<INotificationService>();

            // Initialize filter options
            _filterOptions = new ObservableCollection<string> { Resources.TextResource.FilterAllOption };
            foreach (var option in Enum.GetValues(typeof(ParkingSessionStatus)).Cast<ParkingSessionStatus>())
            {
                _filterOptions.Add(option.ToString());
            }

            // Initialize collections
            _allParkingSessions = new ObservableCollection<ParkingSessionItem>();
            _filteredData = new ObservableCollection<ParkingSessionItem>();

            // Commands
            RefreshCommand = ReactiveCommand.CreateFromTask(RefreshAsync);
            ViewDetailsCommand = ReactiveCommand.CreateFromTask<ParkingSessionItem>(ViewDetailsAsync);
            FilterChangedCommand = ReactiveCommand.Create<string>(OnFilterChanged);

            // Search functionality
            this.WhenAnyValue(x => x.SearchText)
                .Throttle(TimeSpan.FromMilliseconds(300))
                .ObserveOn(RxApp.MainThreadScheduler)
                .Subscribe(_ => ApplyFilter());

            // Load initial data
            Task.Run(async () => await LoadInitialDataAsync());
        }

        public string SearchText
        {
            get => _searchText;
            set => this.RaiseAndSetIfChanged(ref _searchText, value);
        }

        public string SelectedFilter
        {
            get => _selectedFilter;
            set => this.RaiseAndSetIfChanged(ref _selectedFilter, value);
        }

        public ObservableCollection<ParkingSessionItem> FilteredData
        {
            get => _filteredData;
            set => this.RaiseAndSetIfChanged(ref _filteredData, value);
        }

        public ObservableCollection<string> FilterOptions
        {
            get => _filterOptions;
            set => this.RaiseAndSetIfChanged(ref _filterOptions, value);
        }

        public string ResultSummary
        {
            get => _resultSummary;
            set => this.RaiseAndSetIfChanged(ref _resultSummary, value);
        }

        public bool IsLoading
        {
            get => _isLoading;
            set => this.RaiseAndSetIfChanged(ref _isLoading, value);
        }

        // Commands
        public ReactiveCommand<Unit, Unit> RefreshCommand { get; }
        public ReactiveCommand<ParkingSessionItem, Unit> ViewDetailsCommand { get; }
        public ReactiveCommand<string, Unit> FilterChangedCommand { get; }

        // Command implementations
        private async Task LoadInitialDataAsync()
        {
            try
            {
                IsLoading = true;
                await LoadParkingSessionsAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ParkingSessionsViewModel: Error loading initial data: {ex.Message}");
                await _notificationService.ShowErrorNotificationAsync(Resources.TextResource.NotificationLoadingErrorTitle, 
                    Resources.TextResource.NotificationFailedToLoadParkingSessionsMessage);
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task RefreshAsync()
        {
            try
            {
                IsLoading = true;
                SearchText = string.Empty;
                SelectedFilter = Resources.TextResource.FilterAllOption;
                await LoadParkingSessionsAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ParkingSessionsViewModel: Error refreshing data: {ex.Message}");
                await _notificationService.ShowErrorNotificationAsync(Resources.TextResource.NotificationRefreshErrorTitle, 
                    Resources.TextResource.NotificationFailedToRefreshParkingSessionsMessage);
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task LoadParkingSessionsAsync()
        {
            try
            {
                // Get parking lot ID from current user
                var currentUser = AuthenticationState.CurrentUser;
                var parkingLotId = currentUser?.ParkingLotId ?? "";

                var items = await _parkingSessionService.GetParkingSessionList(parkingLotId);
                
                _allParkingSessions.Clear();
                foreach (var item in items)
                {
                    _allParkingSessions.Add(item);
                }

                ApplyFilter();
                
                System.Diagnostics.Debug.WriteLine($"ParkingSessionsViewModel: Loaded {items.Count} parking sessions");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ParkingSessionsViewModel: Error loading parking sessions: {ex.Message}");
                throw;
            }
        }

        private async Task ViewDetailsAsync(ParkingSessionItem sessionItem)
        {
            try
            {
                IsLoading = true;
                
                // Get detailed session information from the API using session ID
                var sessionDetails = await _parkingSessionService.GetParkingSessionDetailsAsync(sessionItem.Id);
                
                if (sessionDetails == null)
                {
                    await _notificationService.ShowWarningNotificationAsync(Resources.TextResource.NotificationSessionNotFoundTitle, 
                        string.Format(Resources.TextResource.NotificationCouldNotLoadSessionDetailsMessage, sessionItem.LicensePlate));
                    return;
                }

                // Convert DTO to model for UI
                var details = ConvertDtoToParkingSessionDetails(sessionDetails, sessionItem);
                var detailsViewModel = new ParkingSessionDetailsViewModel(HostScreen, details, _parkingSessionService);
                
                HostScreen.Router.Navigate.Execute(detailsViewModel).Subscribe();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ParkingSessionsViewModel: Error loading session details: {ex.Message}");
                await _notificationService.ShowErrorNotificationAsync(Resources.TextResource.NotificationLoadingErrorTitle, 
                    string.Format(Resources.TextResource.NotificationFailedToLoadSessionDetailsMessage, ex.Message));
            }
            finally
            {
                IsLoading = false;
            }
        }

        private void OnFilterChanged(string filter)
        {
            SelectedFilter = filter;
            ApplyFilter();
        }

        // Update the ApplyFilter method to use the correct namespace:
        private void ApplyFilter()
        {
            var filteredItems = _allParkingSessions.AsEnumerable();

            // Apply status filter
            if (SelectedFilter != Resources.TextResource.FilterAllOption)
            {
                // Compare against localized status
                filteredItems = filteredItems.Where(s => 
                    ParkingSessionLocalizationHelper.GetLocalizedStatus(s.Status) == SelectedFilter);
            }

            // Apply search filter
            if (!string.IsNullOrWhiteSpace(SearchText))
            {
                filteredItems = filteredItems.Where(s =>
                    s.LicensePlate.Contains(SearchText, StringComparison.OrdinalIgnoreCase));
            }

            FilteredData = new ObservableCollection<ParkingSessionItem>(filteredItems.ToList());
            UpdateResultSummary();
        }

        // Update the UpdateResultSummary method:
        private void UpdateResultSummary()
        {
            var totalCount = FilteredData.Count;
            var allCount = _allParkingSessions.Count;
            var activeCount = FilteredData.Count(s => s.Status == ParkingSessionStatus.Parking.ToString());
            var completedCount = FilteredData.Count(s => s.Status == ParkingSessionStatus.Finished.ToString());

            if (!string.IsNullOrWhiteSpace(SearchText) || SelectedFilter != Resources.TextResource.FilterAllOption)
            {
                ResultSummary = string.Format(Resources.TextResource.ParkingSessionSearchResultSummaryMessage, totalCount, allCount, completedCount, activeCount);
            }
            else
            {
                ResultSummary = string.Format(Resources.TextResource.ParkingSessionTotalSummaryMessage, totalCount, completedCount, activeCount);
            }
        }

        private ParkingSessionDetails ConvertDtoToParkingSessionDetails(
            ParkingSessionDetailsForParkingLotDto dto, 
            ParkingSessionItem sessionItem)
        {
            return new ParkingSessionDetails
            {
                Id = dto.Id,
                LicensePlate = dto.Vehicle?.LicensePlate ?? sessionItem.LicensePlate,
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
                    LicensePlate = dto.Vehicle.LicensePlate ?? sessionItem.LicensePlate,
                    Brand = dto.Vehicle.Brand,
                    Model = dto.Vehicle.Model,
                    Color = dto.Vehicle.Color,
                    Status = dto.Vehicle.Status
                } : new VehicleSummary 
                { 
                    LicensePlate = sessionItem.LicensePlate,
                    Brand = Resources.TextResource.UnknownText,
                    Model = Resources.TextResource.UnknownText,
                    Color = Resources.TextResource.UnknownText,
                    Status = Resources.TextResource.UnknownText
                },
                Owner = dto.Owner != null ? new ClientSummary 
                { 
                    FullName = dto.Owner.FullName ?? Resources.TextResource.UnknownText, 
                    PhoneNumber = dto.Owner.PhoneNumber ?? Resources.TextResource.UnknownText
                } : new ClientSummary { FullName = Resources.TextResource.UnknownText, PhoneNumber = Resources.TextResource.UnknownText }
            };
        }
    }
}