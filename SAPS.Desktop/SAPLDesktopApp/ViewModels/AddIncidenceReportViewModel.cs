using ReactiveUI;
using SAPLDesktopApp.Models;
using SAPLDesktopApp.Helpers;
using SAPLDesktopApp.Services;
using SAPLDesktopApp.DTOs.Concrete.IncidenceReportDtos;
using System;
using System.Reactive;
using System.Windows.Input;
using Avalonia;
using System.Collections.ObjectModel;
using System.Reactive.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Avalonia.Platform.Storage;
using System.IO;
using System.Collections.Generic;

namespace SAPLDesktopApp.ViewModels
{
    public class AddIncidenceReportViewModel : ViewModelBase, IRoutableViewModel
    {
        public string? UrlPathSegment { get; }
        public IScreen HostScreen { get; }

        // Services
        private readonly IIncidenceReportService _incidentService;
        private readonly INotificationService _notificationService;
        private readonly IFileManagementService _fileManagementService;

        // Form fields
        private string _header = "";
        private string _description = "";
        private string _priority;
        private string _location = "";
        private string _reporterName = "";
        private string _notes = "";
        private bool _isSubmitting = false;

        // Collections
        public ObservableCollection<UploadedIncidenceReportEvidence> AttachedEvidences { get; }
        public ObservableCollection<string> PriorityOptions { get; }

        // Event to notify when an incident is created
        public event Action? IncidentCreated;

        // Form properties
        [Required(ErrorMessage = "Header is required")]
        public string Header
        {
            get => _header;
            set => this.RaiseAndSetIfChanged(ref _header, value);
        }

        [Required(ErrorMessage = "Description is required")]
        public string Description
        {
            get => _description;
            set => this.RaiseAndSetIfChanged(ref _description, value);
        }

        public string Priority
        {
            get => _priority;
            set => this.RaiseAndSetIfChanged(ref _priority, value);
        }

        public string Location
        {
            get => _location;
            set => this.RaiseAndSetIfChanged(ref _location, value);
        }

        public string ReporterName
        {
            get => _reporterName;
            set => this.RaiseAndSetIfChanged(ref _reporterName, value);
        }

        public string Notes
        {
            get => _notes;
            set => this.RaiseAndSetIfChanged(ref _notes, value);
        }

        public bool IsSubmitting
        {
            get => _isSubmitting;
            set => this.RaiseAndSetIfChanged(ref _isSubmitting, value);
        }

        // Validation properties
        public bool IsFormValid => !string.IsNullOrWhiteSpace(Header) &&
                                  !string.IsNullOrWhiteSpace(Description);

        public bool CanSubmit => IsFormValid && !IsSubmitting;

        // Display properties
        public bool HasAttachments => AttachedEvidences.Count > 0;
        public string AttachmentCountText => AttachedEvidences.Count switch
        {
            0 => Resources.TextResource.NoAttachmentsMessage,
            1 => Resources.TextResource.OneAttachmentsMessage,
            _ => string.Format(Resources.TextResource.MultipleAttachmentsMessage, AttachedEvidences.Count)
        };

        // Commands
        public ICommand BackCommand { get; }
        public ReactiveCommand<Unit, Unit> SubmitCommand { get; }
        public ReactiveCommand<Unit, Unit> AttachFileCommand { get; }
        public ReactiveCommand<UploadedIncidenceReportEvidence, Unit> RemoveAttachmentCommand { get; }
        public ReactiveCommand<Unit, Unit> ClearFormCommand { get; }
        public Interaction<Unit, IStorageFile[]?> ShowFilePicker { get; } = new();

        public AddIncidenceReportViewModel(IScreen screen)
        {
            HostScreen = screen;
            UrlPathSegment = "addincident";

            _incidentService = ServiceLocator.GetService<IIncidenceReportService>() ?? throw new InvalidOperationException(Resources.TextResource.IncidenceReportServiceNotRegistered);
            _notificationService = ServiceLocator.GetService<INotificationService>();
            _fileManagementService = ServiceLocator.GetService<IFileManagementService>() ?? throw new InvalidOperationException("FileManagementService not registered");

            // Initialize collections
            AttachedEvidences = new ObservableCollection<UploadedIncidenceReportEvidence>();

            // Use localized priority options
            PriorityOptions = new ObservableCollection<string>(IncidentReportLocalizationHelper.GetPriorityOptions());
            _priority = PriorityOptions.FirstOrDefault() ?? Resources.TextResource.PriorityLow;

            // Get reporter name from current user
            var currentUser = AuthenticationState.CurrentUser;
            ReporterName = currentUser?.FullName ?? Resources.TextResource.UnknownUserName;

            BackCommand = ReactiveCommand.Create(GoBack);

            var canSubmit = this.WhenAnyValue(
                x => x.Header,
                x => x.Description,
                x => x.IsSubmitting,
                (header, description, submitting) =>
                    !string.IsNullOrWhiteSpace(header) &&
                    !string.IsNullOrWhiteSpace(description) &&
                    !submitting);

            SubmitCommand = ReactiveCommand.CreateFromTask(SubmitIncident, canSubmit);
            AttachFileCommand = ReactiveCommand.CreateFromTask(AttachFile);
            RemoveAttachmentCommand = ReactiveCommand.Create<UploadedIncidenceReportEvidence>(RemoveAttachment);
            ClearFormCommand = ReactiveCommand.Create(ClearForm);

            this.WhenAnyValue(x => x.Header, x => x.Description, x => x.IsSubmitting)
                .Subscribe(_ =>
                {
                    this.RaisePropertyChanged(nameof(IsFormValid));
                    this.RaisePropertyChanged(nameof(CanSubmit));
                });

            AttachedEvidences.CollectionChanged += (_, _) =>
            {
                this.RaisePropertyChanged(nameof(HasAttachments));
                this.RaisePropertyChanged(nameof(AttachmentCountText));
            };

            // Cleanup old temp files on startup
            _ = Task.Run(async () => await _fileManagementService.CleanupOldTempFilesAsync(TimeSpan.FromDays(1)));
        }

        private void GoBack()
        {
            // Clean up temp files when going back
            _ = Task.Run(async () => await CleanupTempFilesAsync());
            HostScreen.Router.NavigateBack.Execute().Subscribe();
        }

        private async Task SubmitIncident()
        {
            if (!IsFormValid) return;

            try
            {
                IsSubmitting = true;

                var request = new CreateIncidentReportRequest
                {
                    Header = Header,
                    Priority = IncidentReportLocalizationHelper.GetApiPriorityValue(Priority),
                    Description = Description,
                    UploadedEvidences = AttachedEvidences.ToArray()
                };

                var result = await _incidentService.CreateIncidentReportAsync(request);

                // Move temp files to permanent storage on successful upload
                await MoveTempFilesToPermanentAsync(result.Id);

                await _notificationService.ShowNotificationAsync(
                    Resources.TextResource.NotificationIncidentReportCreatedTitle,
                    string.Format(Resources.TextResource.NotificationIncidentReportCreatedMessage, Header));

                // Notify that an incident was created
                IncidentCreated?.Invoke();

                // Navigate back to list
                GoBack();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"AddIncidenceReportViewModel: Error creating incident: {ex.Message}");
                
                // Clean up temp files on failure
                await CleanupTempFilesAsync();
                
                await _notificationService.ShowErrorNotificationAsync(
                    Resources.TextResource.NotificationIncidentCreationFailedTitle,
                    string.Format(Resources.TextResource.NotificationIncidentCreationFailedMessage, ex.Message));
            }
            finally
            {
                IsSubmitting = false;
            }
        }

        private async Task AttachFile()
        {
            try
            {
                var files = await ShowFilePicker.Handle(Unit.Default);
                if (files != null)
                {
                    foreach (var file in files)
                    {
                        var fileSize = 0L;
                        
                        // Use stream to get the accurate file size
                        try
                        {
                            using var stream = await file.OpenReadAsync();
                            fileSize = stream.Length;
                        }
                        catch (Exception ex)
                        {
                            System.Diagnostics.Debug.WriteLine($"Failed to get file size via stream: {ex.Message}");
                            
                            // Fallback to GetBasicPropertiesAsync if stream fails
                            try
                            {
                                var properties = await file.GetBasicPropertiesAsync();
                                fileSize = (long)(properties?.Size ?? 0);
                            }
                            catch (Exception ex2)
                            {
                                System.Diagnostics.Debug.WriteLine($"Failed to get file size via properties: {ex2.Message}");
                            }
                        }

                        // Copy file to temp storage
                        var tempFilePath = await _fileManagementService.CopyToTempAsync(file.Path.LocalPath, file.Name);

                        var evidence = new UploadedIncidenceReportEvidence
                        {
                            OriginalFileName = file.Name,
                            FileSize = fileSize,
                            FileExtension = Path.GetExtension(file.Name),
                            LocalUrl = file.Path.LocalPath,
                            TempFilePath = tempFilePath,
                            UploadedAt = DateTime.Now
                        };
                        
                        AttachedEvidences.Add(evidence);
                        
                        System.Diagnostics.Debug.WriteLine($"File attached: {file.Name}, Size: {fileSize} bytes, Temp: {tempFilePath}");
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error attaching file: {ex.Message}");
                await _notificationService.ShowErrorNotificationAsync(
                    "File Attachment Error",
                    $"Failed to attach file: {ex.Message}");
            }
        }

        private async void RemoveAttachment(UploadedIncidenceReportEvidence evidence)
        {
            if (evidence != null && AttachedEvidences.Contains(evidence))
            {
                AttachedEvidences.Remove(evidence);
                
                // Delete temp file when removing attachment
                if (!string.IsNullOrEmpty(evidence.TempFilePath))
                {
                    await _fileManagementService.DeleteTempFileAsync(evidence.TempFilePath);
                }
            }
        }

        private async void ClearForm()
        {
            // Clean up temp files before clearing
            await CleanupTempFilesAsync();
            
            Header = "";
            Description = "";
            Priority = Resources.TextResource.PriorityMedium;
            Location = "";
            Notes = "";
            AttachedEvidences.Clear();
        }

        private async Task MoveTempFilesToPermanentAsync(string incidentId)
        {
            foreach (var evidence in AttachedEvidences)
            {
                if (!string.IsNullOrEmpty(evidence.TempFilePath) && !evidence.IsUploaded)
                {
                    try
                    {
                        var permanentPath = await _fileManagementService.MoveToPermamentAsync(evidence.TempFilePath, incidentId);
                        evidence.PermanentFilePath = permanentPath;
                        evidence.IsUploaded = true;
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine($"Failed to move temp file to permanent: {ex.Message}");
                    }
                }
            }
        }

        private async Task CleanupTempFilesAsync()
        {
            foreach (var evidence in AttachedEvidences)
            {
                if (!string.IsNullOrEmpty(evidence.TempFilePath) && !evidence.IsUploaded)
                {
                    await _fileManagementService.DeleteTempFileAsync(evidence.TempFilePath);
                }
            }
        }
    }
}