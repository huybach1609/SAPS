using ReactiveUI;
using SAPLDesktopApp.Models;
using System;
using System.Globalization;
using System.Reactive;
using System.Windows.Input;

namespace SAPLDesktopApp.ViewModels
{
    public class ShiftDiaryDetailsViewModel : ViewModelBase, IRoutableViewModel
    {
        public string? UrlPathSegment { get; }
        public IScreen HostScreen { get; }
        public ShiftDiaryDetails ShiftDiary { get; }

        public ShiftDiaryDetailsViewModel(IScreen screen, ShiftDiaryDetails shiftDiary)
        {
            HostScreen = screen;
            ShiftDiary = shiftDiary;
            UrlPathSegment = "shiftdiarydetails";

            BackCommand = ReactiveCommand.Create(GoBack);
        }

        private void GoBack()
        {
            HostScreen.Router.NavigateBack.Execute().Subscribe();
        }

        public ICommand BackCommand { get; }

        public string FormattedCreatedAt => ShiftDiary.CreatedAt.ToString(Resources.TextResource.DateTimeFormatLong, CultureInfo.CurrentCulture);
        public string FormattedDate => ShiftDiary.CreatedAt.ToString(Resources.TextResource.DateFormatShort, CultureInfo.CurrentCulture);
        public string FormattedTime => ShiftDiary.CreatedAt.ToString(Resources.TextResource.TimeFormatShort, CultureInfo.CurrentCulture);
    }
}