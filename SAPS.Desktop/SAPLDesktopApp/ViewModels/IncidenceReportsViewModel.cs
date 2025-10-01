using Microsoft.Extensions.DependencyInjection;
using ReactiveUI;
using SAPLDesktopApp.DTOs.Concrete.IncidenceReportDtos;
using SAPLDesktopApp.Helpers;
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
    public class IncidenceReportsViewModel : ViewModelBase, IRoutableViewModel
    {
        public string? UrlPathSegment { get; }
        public IScreen HostScreen { get; }

        private readonly IIncidenceReportService _incidentService;
        private readonly INotificationService _notificationService;

        private ObservableCollection<IncidenceReportSummary> _incidentData = new();
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

        public ObservableCollection<IncidenceReportSummary> IncidentData
        {
            get => _incidentData;
            set => this.RaiseAndSetIfChanged(ref _incidentData, value);
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
        public ReactiveCommand<IncidenceReportSummary, Unit> ViewDetailsCommand { get; }
        public ReactiveCommand<Unit, Unit> CreateNewIncidentCommand { get; }

        private IReadOnlyList<IncidenceReportSummary> _allIncidents = Array.Empty<IncidenceReportSummary>();

        public IncidenceReportsViewModel(IScreen screen)
        {
            HostScreen = screen;
            UrlPathSegment = "incidentreports";
            _incidentService = ServiceLocator.ServiceProvider.GetRequiredService<IIncidenceReportService>();
            _notificationService = ServiceLocator.GetService<INotificationService>();

            RefreshCommand = ReactiveCommand.CreateFromTask(RefreshAsync);
            ViewDetailsCommand = ReactiveCommand.CreateFromTask<IncidenceReportSummary>(ViewDetailsAsync);
            CreateNewIncidentCommand = ReactiveCommand.Create(CreateNewIncident);

            // Initial load
            _ = Task.Run(async () => await LoadInitialDataAsync());

            // Subscribe to navigation events to refresh when returning from add page
            HostScreen.Router.CurrentViewModel
                .Subscribe(viewModel =>
                {
                    if (viewModel == this)
                    {
                        _ = Task.Run(async () => await RefreshDataIfNeeded());
                    }
                });
        }

        private async Task RefreshDataIfNeeded()
        {
            await Task.Delay(500);
            
            if (!IsLoading && _allIncidents.Any())
            {
                await RefreshAsync();
            }
        }

        private async Task LoadInitialDataAsync()
        {
            try
            {
                IsLoading = true;
                await LoadIncidentReportsAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"IncidenceReportsViewModel: Error loading initial data: {ex.Message}");
                if (_notificationService != null)
                {
                    await _notificationService.ShowErrorNotificationAsync(Resources.TextResource.NotificationLoadingErrorTitle, 
                        Resources.TextResource.NotificationFailedToLoadIncidentReportsMessage);
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
                await LoadIncidentReportsAsync();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"IncidenceReportsViewModel: Error refreshing data: {ex.Message}");
                if (_notificationService != null)
                {
                    await _notificationService.ShowErrorNotificationAsync(Resources.TextResource.NotificationRefreshErrorTitle, 
                        Resources.TextResource.NotificationFailedToRefreshIncidentReportsMessage);
                }
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task LoadIncidentReportsAsync()
        {
            try
            {
                // Get parking lot ID from current user
                var currentUser = AuthenticationState.CurrentUser;
                var parkingLotId = currentUser?.ParkingLotId ?? "";

                var listRequest = new GetIncidenReportListRequest
                {
                    ParkingLotId = parkingLotId
                    // Other filters can be added here as needed
                };

                var result = await _incidentService.GetIncidentReportListAsync(listRequest);
                
                // Convert DTOs to models
                var incidents = result.Select(dto => ConvertDtoToModel(dto)).ToList();
                
                _allIncidents = incidents;
                IncidentData = new ObservableCollection<IncidenceReportSummary>(incidents);
                UpdateResultSummary();
                
                System.Diagnostics.Debug.WriteLine($"IncidenceReportsViewModel: Loaded {incidents.Count} incident reports");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"IncidenceReportsViewModel: Error loading incident reports: {ex.Message}");
                throw;
            }
        }

        private async Task ViewDetailsAsync(IncidenceReportSummary summary)
        {
            try
            {
                IsLoading = true;
                
                var detailsDto = await _incidentService.GetIncidentReportDetailsAsync(summary.Id);
                if (detailsDto != null)
                {
                    // Convert DTO to model
                    var detailsModel = ConvertDetailsDtoToModel(detailsDto);
                    
                    var detailsViewModel = new IncidenceReportDetailsViewModel(HostScreen, detailsModel);
                    HostScreen.Router.Navigate.Execute(detailsViewModel).Subscribe();
                }
                else
                {
                    if (_notificationService != null)
                    {
                        await _notificationService.ShowWarningNotificationAsync(Resources.TextResource.NotificationNotFoundTitle, 
                            Resources.TextResource.NotificationIncidentReportDetailsCouldNotBeLoadedMessage);
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"IncidenceReportsViewModel: Error viewing details: {ex.Message}");
                if (_notificationService != null)
                {
                    await _notificationService.ShowErrorNotificationAsync(Resources.TextResource.NotificationLoadingErrorTitle, 
                        string.Format(Resources.TextResource.NotificationFailedToLoadIncidentReportDetailsMessage, ex.Message));
                }
            }
            finally
            {
                IsLoading = false;
            }
        }

        private void CreateNewIncident()
        {
            var addIncidentViewModel = ActivatorUtilities.CreateInstance<AddIncidenceReportViewModel>(
                ServiceLocator.ServiceProvider,
                HostScreen
            );
            
            HostScreen.Router.Navigate.Execute(addIncidentViewModel).Subscribe();
        }

        private void ApplyFilter()
        {
            if (string.IsNullOrWhiteSpace(SearchText))
            {
                IncidentData = new ObservableCollection<IncidenceReportSummary>(_allIncidents);
            }
            else
            {
                var filtered = _allIncidents
                    .Where(i => (i.Header?.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ?? false) ||
                                (i.LocalizedStatus?.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ?? false) ||
                                (i.LocalizedPriority?.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ?? false))
                    .ToList();
                IncidentData = new ObservableCollection<IncidenceReportSummary>(filtered);
            }
            UpdateResultSummary();
        }

        private void UpdateResultSummary()
        {
            var totalCount = IncidentData.Count;
            var allCount = _allIncidents.Count;

            if (!string.IsNullOrWhiteSpace(SearchText))
                ResultSummary = string.Format(Resources.TextResource.SearchResultSummaryMessage, totalCount, allCount);
            else
                ResultSummary = string.Format(Resources.TextResource.MyIncidentReportsSummaryMessage, totalCount);
        }

        private IncidenceReportSummary ConvertDtoToModel(IncidentReportSummaryDto dto)
        {
            return new IncidenceReportSummary
            {
                Id = dto.Id,
                Header = dto.Header ?? "",
                ReportedDate = dto.ReportedDate,
                Priority = dto.Priority ?? "",
                Status = dto.Status ?? ""
            };
        }

        private IncidenceReportDetails ConvertDetailsDtoToModel(IncidentReportDetailsDto dto)
        {
            return new IncidenceReportDetails
            {
                Id = dto.Id,
                Header = dto.Header ?? Resources.TextResource.UnknownText,
                ReportedDate = dto.ReportedDate,
                Priority = dto.Priority ?? Resources.TextResource.UnknownText,
                Status = dto.Status ?? Resources.TextResource.UnknownText,
                Description = dto.Description ?? Resources.TextResource.UnknownText,
                ReporterName = dto.Reporter?.FullName ?? Resources.TextResource.UnknownText,
                // Convert attachments to evidences if needed
                Evidences = dto.Attachments?.Select(att => new IncidenceReportEvidence
                {
                    OriginalFileName = att.OriginalFileName ?? "",
                    FileSize = att.FileSize,
                    FileExtension = att.FileExtension ?? "",
                    DownloadUrl = att.DownloadUrl ?? "",
                    UploadedAt = att.UploadedAt
                }).ToArray() ?? Array.Empty<IncidenceReportEvidence>()
            };
        }
    }
}