using ReactiveUI;
using SAPLDesktopApp.Models;
using SAPLDesktopApp.Services;
using SAPLDesktopApp.DTOs.Concrete.IncidenceReportDtos;
using System;
using System.Reactive;
using System.Windows.Input;
using System.Threading.Tasks;
using System.Diagnostics;
using System.Collections.ObjectModel;
using System.Linq;
using SAPLDesktopApp.Helpers;

namespace SAPLDesktopApp.ViewModels
{
    public class IncidenceReportDetailsViewModel : ViewModelBase, IRoutableViewModel
    {
        public string? UrlPathSegment { get; }
        public IScreen HostScreen { get; }

        private IncidenceReportDetails _incident;
        private bool _isLoading = false;
        private string _selectedStatus;

        // Services
        private readonly IIncidenceReportService _incidentService;
        private readonly INotificationService _notificationService;
        private readonly IFileManagementService _fileManagementService;

        public IncidenceReportDetails Incident
        {
            get => _incident;
            private set => this.RaiseAndSetIfChanged(ref _incident, value);
        }

        public bool IsLoading
        {
            get => _isLoading;
            set => this.RaiseAndSetIfChanged(ref _isLoading, value);
        }

        public string SelectedStatus
        {
            get => _selectedStatus;
            set => this.RaiseAndSetIfChanged(ref _selectedStatus, value);
        }

        // Status options for dropdown
        public ObservableCollection<string> StatusOptions { get; }
        
        // Evidence files with download state
        public ObservableCollection<EvidenceFileInfo> EvidenceFiles { get; }

        public IncidenceReportDetailsViewModel(IScreen screen, IncidenceReportDetails incident)
        {
            HostScreen = screen;
            _incident = incident ?? throw new ArgumentNullException(nameof(incident));
            UrlPathSegment = "incidentdetails";

            _incidentService = ServiceLocator.GetService<IIncidenceReportService>() ?? throw new InvalidOperationException(Resources.TextResource.IncidenceReportServiceNotRegistered);
            _notificationService = ServiceLocator.GetService<INotificationService>();
            _fileManagementService = ServiceLocator.GetService<IFileManagementService>() ?? throw new InvalidOperationException("FileManagementService not registered");

            // Initialize status options with localized values
            StatusOptions = new ObservableCollection<string>(IncidentReportLocalizationHelper.GetStatusOptions());

            // Set selected status to localized version
            _selectedStatus = IncidentReportLocalizationHelper.GetLocalizedStatus(Incident.Status);

            // Initialize evidence files collection
            EvidenceFiles = new ObservableCollection<EvidenceFileInfo>();
            InitializeEvidenceFiles();

            // Commands
            BackCommand = ReactiveCommand.Create(GoBack);
            RefreshCommand = ReactiveCommand.CreateFromTask(RefreshAsync);
            OpenEvidenceCommand = ReactiveCommand.Create<IncidenceReportEvidence>(OpenEvidence);
            DownloadOrOpenEvidenceCommand = ReactiveCommand.CreateFromTask<EvidenceFileInfo>(DownloadOrOpenEvidenceAsync);
        }

        private void InitializeEvidenceFiles()
        {
            EvidenceFiles.Clear();
            if (Incident.Evidences != null)
            {
                foreach (var evidence in Incident.Evidences)
                {
                    var isDownloaded = _fileManagementService.DoesEvidenceFileExist(Incident.Id, evidence.OriginalFileName);
                    var localPath = isDownloaded ? _fileManagementService.GetEvidenceFilePath(Incident.Id, evidence.OriginalFileName) : null;

                    var evidenceFileInfo = new EvidenceFileInfo
                    {
                        Evidence = evidence,
                        IsDownloaded = isDownloaded,
                        LocalFilePath = localPath,
                        IsDownloading = false
                    };

                    EvidenceFiles.Add(evidenceFileInfo);
                }
            }
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

                var refreshedDetails = await _incidentService.GetIncidentReportDetailsAsync(Incident.Id);
                if (refreshedDetails != null)
                {
                    Incident = ConvertDtoToModel(refreshedDetails);
                    SelectedStatus = Incident.Status;
                    InitializeEvidenceFiles();

                    System.Diagnostics.Debug.WriteLine($"IncidenceReportDetailsViewModel: Refreshed details for incident {Incident.Id}");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"IncidenceReportDetailsViewModel: Error refreshing details: {ex.Message}");
                if (_notificationService != null)
                {
                    await _notificationService.ShowErrorNotificationAsync(Resources.TextResource.NotificationRefreshErrorTitle, 
                        string.Format(Resources.TextResource.NotificationRefreshIncidentDetailsFailedMessage, ex.Message));
                }
            }
            finally
            {
                IsLoading = false;
            }
        }

        private void OpenEvidence(IncidenceReportEvidence evidence)
        {
            try
            {
                if (evidence != null && !string.IsNullOrWhiteSpace(evidence.DownloadUrl))
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = evidence.DownloadUrl,
                        UseShellExecute = true
                    });
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error opening evidence: {ex.Message}");
                if (_notificationService != null)
                {
                    _ = Task.Run(async () => await _notificationService.ShowWarningNotificationAsync(Resources.TextResource.NotificationFileErrorTitle, 
                        Resources.TextResource.NotificationUnableToOpenEvidenceFileMessage));
                }
            }
        }

        private async Task DownloadOrOpenEvidenceAsync(EvidenceFileInfo evidenceFileInfo)
        {
            if (evidenceFileInfo == null) return;

            try
            {
                if (evidenceFileInfo.IsDownloaded && !string.IsNullOrEmpty(evidenceFileInfo.LocalFilePath))
                {
                    // File exists locally, open it
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = evidenceFileInfo.LocalFilePath,
                        UseShellExecute = true
                    });
                }
                else if (!evidenceFileInfo.IsDownloading)
                {
                    // File doesn't exist locally, download it
                    evidenceFileInfo.IsDownloading = true;

                    try
                    {
                        var downloadedPath = await _fileManagementService.DownloadEvidenceFileAsync(
                            evidenceFileInfo.Evidence.DownloadUrl,
                            Incident.Id,
                            evidenceFileInfo.Evidence.OriginalFileName);

                        evidenceFileInfo.IsDownloaded = true;
                        evidenceFileInfo.LocalFilePath = downloadedPath;

                        await _notificationService.ShowNotificationAsync(
                            "Download Complete", 
                            $"File '{evidenceFileInfo.Evidence.OriginalFileName}' has been downloaded successfully.");

                        System.Diagnostics.Debug.WriteLine($"Evidence file downloaded: {downloadedPath}");
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine($"Error downloading evidence: {ex.Message}");
                        await _notificationService.ShowErrorNotificationAsync(
                            "Download Failed", 
                            $"Failed to download '{evidenceFileInfo.Evidence.OriginalFileName}': {ex.Message}");
                    }
                    finally
                    {
                        evidenceFileInfo.IsDownloading = false;
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in DownloadOrOpenEvidenceAsync: {ex.Message}");
                await _notificationService.ShowErrorNotificationAsync(
                    "File Operation Failed", 
                    $"Failed to open or download file: {ex.Message}");
            }
        }

        // Commands
        public ICommand BackCommand { get; }
        public ReactiveCommand<Unit, Unit> RefreshCommand { get; }
        public ReactiveCommand<IncidenceReportEvidence, Unit> OpenEvidenceCommand { get; }
        public ReactiveCommand<EvidenceFileInfo, Unit> DownloadOrOpenEvidenceCommand { get; }

        // Essential display properties only
        public bool HasEvidences => Incident?.Evidences?.Length > 0;
        public int EvidenceCount => Incident?.Evidences?.Length ?? 0;
        public bool CanUpdateStatus => !IsLoading;

        public string EvidenceCountText
        {
            get
            {
                var count = EvidenceCount;
                return count switch
                {
                    0 => Resources.TextResource.NoEvidenceAttachedMessage,
                    1 => Resources.TextResource.OneEvidenceFileMessage,
                    _ => string.Format(Resources.TextResource.MultipleEvidenceFilesMessage, count)
                };
            }
        }

        private IncidenceReportDetails ConvertDtoToModel(IncidentReportDetailsDto dto)
        {
            return new IncidenceReportDetails
            {
                Id = dto.Id,
                Header = dto.Header ?? "",
                ReportedDate = dto.ReportedDate,
                Priority = dto.Priority ?? "",
                Status = dto.Status ?? "",
                Description = dto.Description ?? "",
                // Convert attachments to evidences
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

        // Add these UI-friendly properties for localized display:
        public string LocalizedStatus => IncidentReportLocalizationHelper.GetLocalizedStatus(Incident.Status);
        public string LocalizedPriority => IncidentReportLocalizationHelper.GetLocalizedPriority(Incident.Priority);
    }
}