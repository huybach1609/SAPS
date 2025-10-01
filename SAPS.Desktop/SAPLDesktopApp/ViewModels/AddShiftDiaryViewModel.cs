using ReactiveUI;
using SAPLDesktopApp.DTOs.Concrete.ShiftDiaryDtos;
using SAPLDesktopApp.Services;
using System;
using System.Reactive;
using System.Threading.Tasks;
using System.Windows.Input;

namespace SAPLDesktopApp.ViewModels
{
    public class AddShiftDiaryViewModel : ViewModelBase, IRoutableViewModel
    {
        public string? UrlPathSegment { get; }
        public IScreen HostScreen { get; }

        private readonly IShiftDiaryService _shiftDiaryService;
        private readonly INotificationService _notificationService;

        private string _header = "";
        private string _body = "";
        private bool _isSubmitting = false;

        public string Header
        {
            get => _header;
            set => this.RaiseAndSetIfChanged(ref _header, value);
        }

        public string Body
        {
            get => _body;
            set => this.RaiseAndSetIfChanged(ref _body, value);
        }

        public bool IsSubmitting
        {
            get => _isSubmitting;
            set => this.RaiseAndSetIfChanged(ref _isSubmitting, value);
        }

        public bool CanSubmit => !string.IsNullOrWhiteSpace(Header) && !string.IsNullOrWhiteSpace(Body) && !IsSubmitting;

        public ICommand BackCommand { get; }
        public ReactiveCommand<Unit, Unit> SubmitCommand { get; }
        public ReactiveCommand<Unit, Unit> ClearFormCommand { get; }

        // Event to notify when a shift diary is created
        public event Action? ShiftDiaryCreated;

        public AddShiftDiaryViewModel(IScreen screen)
        {
            HostScreen = screen;
            UrlPathSegment = "addshiftdiary";
            _shiftDiaryService = ServiceLocator.GetService<IShiftDiaryService>() ?? throw new InvalidOperationException(Resources.TextResource.ShiftDiaryServiceNotRegistered);
            _notificationService = ServiceLocator.GetService<INotificationService>();

            BackCommand = ReactiveCommand.Create(GoBack);
            SubmitCommand = ReactiveCommand.CreateFromTask(SubmitAsync);
            ClearFormCommand = ReactiveCommand.Create(ClearForm);

            this.WhenAnyValue(x => x.Header, x => x.Body, x => x.IsSubmitting)
                .Subscribe(_ => this.RaisePropertyChanged(nameof(CanSubmit)));
        }

        private void GoBack()
        {
            HostScreen.Router.NavigateBack.Execute().Subscribe();
        }

        private async Task SubmitAsync()
        {
            if (!CanSubmit) return;

            try
            {
                IsSubmitting = true;

                // Get parking lot ID from current user
                var currentUser = AuthenticationState.CurrentUser;
                var parkingLotId = currentUser?.ParkingLotId ?? "";

                if (string.IsNullOrEmpty(parkingLotId))
                {
                    await _notificationService.ShowWarningNotificationAsync(
                        Resources.TextResource.NotificationMissingInformationTitle,
                        Resources.TextResource.NotificationMissingParkingLotMessage);
                    return;
                }

                // Create shift diary request with form data
                var request = new CreateShiftDiaryRequest
                {
                    Header = Header.Trim(),
                    Body = Body.Trim(),
                    ParkingLotId = parkingLotId
                };

                await _shiftDiaryService.CreateShiftDiaryAsync(request);

                await _notificationService.ShowNotificationAsync(
                    Resources.TextResource.NotificationShiftDiaryCreatedTitle,
                    string.Format(Resources.TextResource.NotificationShiftDiaryCreatedMessage, Header));

                // Notify that a shift diary was created
                ShiftDiaryCreated?.Invoke();

                // Navigate back to list
                GoBack();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"AddShiftDiaryViewModel: Error creating shift diary: {ex.Message}");
                await _notificationService.ShowErrorNotificationAsync(
                    Resources.TextResource.NotificationShiftDiaryCreationFailedTitle,
                    string.Format(Resources.TextResource.NotificationShiftDiaryCreationFailedMessage, ex.Message));
            }
            finally
            {
                IsSubmitting = false;
            }
        }

        private void ClearForm()
        {
            Header = "";
            Body = "";
        }
    }
}