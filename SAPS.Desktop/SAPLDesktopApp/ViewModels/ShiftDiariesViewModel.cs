using Microsoft.Extensions.DependencyInjection;
using ReactiveUI;
using SAPLDesktopApp.DTOs.Concrete.ShiftDiaryDtos;
using SAPLDesktopApp.Models;
using SAPLDesktopApp.Services;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Reactive;
using System.Threading.Tasks;
using System.Windows.Input;

namespace SAPLDesktopApp.ViewModels
{
    public class ShiftDiariesViewModel : ViewModelBase, IRoutableViewModel
    {
        public string? UrlPathSegment { get; }
        public IScreen HostScreen { get; }

        private readonly IShiftDiaryService _shiftDiaryService;
        private readonly INotificationService _notificationService;

        private ObservableCollection<ShiftDiarySummary> _shiftDiaryData = new();
        private string _searchText = "";
        private string _resultSummary = "";
        private bool _isLoading = false;

        public string SearchText
        {
            get => _searchText;
            set
            {
                this.RaiseAndSetIfChanged(ref _searchText, value);
                ApplyFilter();
            }
        }

        public ObservableCollection<ShiftDiarySummary> ShiftDiaryData
        {
            get => _shiftDiaryData;
            set => this.RaiseAndSetIfChanged(ref _shiftDiaryData, value);
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

        public ICommand RefreshCommand { get; }
        public ReactiveCommand<ShiftDiarySummary, Unit> ViewDetailsCommand { get; }
        public ReactiveCommand<Unit, Unit> CreateNewShiftDiaryCommand { get; }

        private IReadOnlyList<ShiftDiarySummary> _allShiftDiaries = Array.Empty<ShiftDiarySummary>();

        public ShiftDiariesViewModel(IScreen screen)
        {
            HostScreen = screen;
            UrlPathSegment = "shiftdiaries";
            _shiftDiaryService = ServiceLocator.ServiceProvider.GetRequiredService<IShiftDiaryService>();
            _notificationService = ServiceLocator.GetService<INotificationService>();

            RefreshCommand = ReactiveCommand.CreateFromTask(RefreshAsync);
            ViewDetailsCommand = ReactiveCommand.CreateFromTask<ShiftDiarySummary>(ViewDetailsAsync);
            CreateNewShiftDiaryCommand = ReactiveCommand.Create(CreateNewShiftDiary);

            // Initial load
            _ = Task.Run(async () => await LoadInitialDataAsync());

            // Subscribe to navigation events to refresh when returning from add page
            HostScreen.Router.CurrentViewModel
                .Subscribe(viewModel =>
                {
                    // When navigating back to this view, refresh the data
                    if (viewModel == this)
                    {
                        _ = Task.Run(async () => await RefreshDataIfNeeded());
                    }
                });
        }

        private async Task RefreshDataIfNeeded()
        {
            // Add a small delay to ensure the API has processed the new entry
            await Task.Delay(500);
            
            // Only refresh if we're not already loading and we have existing data
            if (!IsLoading && _allShiftDiaries.Any())
            {
                await RefreshAsync();
            }
        }

        private async Task LoadInitialDataAsync()
        {
            try
            {
                IsLoading = true;
                await LoadShiftDiariesAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ShiftDiariesViewModel: Error loading initial data: {ex.Message}");
                if (_notificationService != null)
                {
                    await _notificationService.ShowErrorNotificationAsync(Resources.TextResource.NotificationLoadingErrorTitle, 
                        Resources.TextResource.NotificationFailedToLoadShiftDiariesMessage);
                }
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
                await LoadShiftDiariesAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ShiftDiariesViewModel: Error refreshing data: {ex.Message}");
                if (_notificationService != null)
                {
                    await _notificationService.ShowErrorNotificationAsync(Resources.TextResource.NotificationRefreshErrorTitle, 
                        Resources.TextResource.NotificationFailedToRefreshShiftDiariesMessage);
                }
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task LoadShiftDiariesAsync()
        {
            try
            {
                // Get parking lot ID from current user
                var currentUser = AuthenticationState.CurrentUser;
                var parkingLotId = currentUser?.ParkingLotId ?? "";

                var listRequest = new GetShiftDiaryListRequest
                {
                    ParkingLotId = parkingLotId
                    // UploadedDate can be null to get all dates
                };

                var result = await _shiftDiaryService.GetShiftDiaryListAsync(listRequest);
                
                // Convert DTOs to models
                var shiftDiaries = result.Select(dto => ConvertSummaryDtoToModel(dto)).ToList();
                
                _allShiftDiaries = shiftDiaries;
                ShiftDiaryData = new ObservableCollection<ShiftDiarySummary>(shiftDiaries);
                UpdateResultSummary();
                
                System.Diagnostics.Debug.WriteLine($"ShiftDiariesViewModel: Loaded {shiftDiaries.Count} shift diaries");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ShiftDiariesViewModel: Error loading shift diaries: {ex.Message}");
                throw;
            }
        }

        private async Task ViewDetailsAsync(ShiftDiarySummary summary)
        {
            try
            {
                IsLoading = true;
                
                var detailsDto = await _shiftDiaryService.GetShiftDiaryDetailsAsync(summary.Id);
                if (detailsDto != null)
                {
                    // Convert DTO to model
                    var detailsModel = ConvertDetailsDtoToModel(detailsDto);
                    
                    // Create the details view model with the model (not DTO)
                    var detailsViewModel = new ShiftDiaryDetailsViewModel(HostScreen, detailsModel);
                    HostScreen.Router.Navigate.Execute(detailsViewModel).Subscribe();
                }
                else
                {
                    if (_notificationService != null)
                    {
                        await _notificationService.ShowWarningNotificationAsync(Resources.TextResource.NotificationNotFoundTitle, 
                            Resources.TextResource.NotificationShiftDiaryDetailsCouldNotBeLoadedMessage);
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ShiftDiariesViewModel: Error viewing details: {ex.Message}");
                if (_notificationService != null)
                {
                    await _notificationService.ShowErrorNotificationAsync(Resources.TextResource.NotificationLoadingErrorTitle, 
                        string.Format(Resources.TextResource.NotificationFailedToLoadShiftDiaryDetailsMessage, ex.Message));
                }
            }
            finally
            {
                IsLoading = false;
            }
        }

        private void CreateNewShiftDiary()
        {
            var addShiftDiaryViewModel = ActivatorUtilities.CreateInstance<AddShiftDiaryViewModel>(
                ServiceLocator.ServiceProvider,
                HostScreen
            );
            
            // Subscribe to the creation event to refresh data immediately
            addShiftDiaryViewModel.ShiftDiaryCreated += OnShiftDiaryCreated;
            
            HostScreen.Router.Navigate.Execute(addShiftDiaryViewModel).Subscribe();
        }

        private void OnShiftDiaryCreated()
        {
            // Refresh the data when a new shift diary is created
            _ = Task.Run(async () =>
            {
                // Small delay to ensure the server has processed the new entry
                await Task.Delay(1000);
                await RefreshAsync();
            });
        }

        private void ApplyFilter()
        {
            if (string.IsNullOrWhiteSpace(SearchText))
            {
                ShiftDiaryData = new ObservableCollection<ShiftDiarySummary>(_allShiftDiaries);
            }
            else
            {
                var filtered = _allShiftDiaries
                    .Where(d => (d.Header?.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ?? false) ||
                                (d.SenderName?.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ?? false))
                    .ToList();
                ShiftDiaryData = new ObservableCollection<ShiftDiarySummary>(filtered);
            }
            UpdateResultSummary();
        }

        private void UpdateResultSummary()
        {
            var totalCount = ShiftDiaryData.Count;
            var allCount = _allShiftDiaries.Count;

            if (!string.IsNullOrWhiteSpace(SearchText))
                ResultSummary = string.Format(Resources.TextResource.ShiftDiarySearchResultSummaryMessage, totalCount, allCount);
            else
                ResultSummary = string.Format(Resources.TextResource.ShiftDiaryTotalSummaryMessage, totalCount);
        }

        private ShiftDiarySummary ConvertSummaryDtoToModel(ShiftDiarySummaryDto dto)
        {
            return new ShiftDiarySummary
            {
                Id = dto.Id,
                Header = dto.Header ?? Resources.TextResource.NoHeaderProvidedText,
                CreatedAt = dto.CreatedAt,
                SenderName = dto.SenderName ?? Resources.TextResource.UnknownSenderText,
            };
        }

        private ShiftDiaryDetails ConvertDetailsDtoToModel(ShiftDiaryDetailsDto dto)
        {
            return new ShiftDiaryDetails
            {
                Id = dto.Id,
                Header = dto.Header ?? Resources.TextResource.NoHeaderProvidedText,
                CreatedAt = dto.CreatedAt,
                SenderName = dto.SenderName ?? Resources.TextResource.UnknownSenderText,
                Body = dto.Body ?? Resources.TextResource.NoContentProvidedText,
            };
        }
    }
}