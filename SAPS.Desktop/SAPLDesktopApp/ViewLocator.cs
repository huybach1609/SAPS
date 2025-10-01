using Avalonia.Controls;
using ReactiveUI;
using SAPLDesktopApp.ViewModels;
using SAPLDesktopApp.Views;
using System;

namespace SAPLDesktopApp
{
    public class ViewLocator : IViewLocator
    {
        public IViewFor? ResolveView<T>(T? viewModel, string? contract = null)
        {
            switch (viewModel)
            {
                case CameraViewModel:
                    return new CameraView();
                case IncidenceReportsViewModel:
                    return new IncidenceReportsView();
                case ParkingSessionDetailsViewModel:
                    return new ParkingSessionDetailsView();
                case IncidenceReportDetailsViewModel:
                    return new IncidenceReportDetailsView();
                case CameraSettingsViewModel:
                    return new CameraSettingsView();
                case ParkingSessionsViewModel:
                    return new ParkingSessionsView();
                case AddIncidenceReportViewModel:
                    return new AddIncidenceReportView();
                case ShiftDiariesViewModel:
                    return new ShiftDiariesView();
                case ShiftDiaryDetailsViewModel:
                    return new ShiftDiaryDetailsView();
                case AddShiftDiaryViewModel:
                    return new AddShiftDiaryView();
                case SettingsViewModel:
                    return new SettingsView();
                case ForgotPasswordViewModel:
                    return new ForgotPasswordWindow();
                case PaymentInfoViewModel:
                    return new PaymentInfoWindow();
                default:
                    throw new ArgumentOutOfRangeException(nameof(viewModel));
            }
        }
    }
}