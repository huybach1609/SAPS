using Microsoft.Extensions.DependencyInjection;
using SAPLDesktopApp.Services;
using SAPLDesktopApp.ViewModels;

namespace SAPLDesktopApp.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            // Register API configuration service
            services.AddSingleton<IDialogService, DialogService>();
            services.AddSingleton<IApiConfigurationService, ApiConfigurationService>();

            // Register only services as singletons
            services.AddSingleton<IAuthenticationService, AuthenticationService>();
            services.AddSingleton<IPopupHostService, PopupHostService>();
            services.AddSingleton<INotificationService, NotificationService>();
            services.AddSingleton<ILoadingService, LoadingService>();
            services.AddTransient<IParkingSessionService, ParkingSessionService>();
            services.AddSingleton<IIncidenceReportService, IncidenceReportService>();
            services.AddSingleton<IShiftDiaryService, ShiftDiaryService>();
            services.AddSingleton<IVehicleService, VehicleService>();
            services.AddSingleton<ISettingsService, SettingsService>();
            services.AddSingleton<ICameraService, CameraService>();
            services.AddSingleton<ICameraSettingsService, CameraSettingsService>();
            services.AddSingleton<ILicensePlateRecognitionService, LicensePlateRecognitionService>();
            services.AddSingleton<IUserService, UserService>();
            services.AddSingleton<IFileManagementService, FileManagementService>();
            services.AddSingleton<IBankService, BankService>(); // Add this line

            // ViewModels are NOT registered in DI - they will be created manually
            // This allows for proper parameter passing and lifecycle management
            services.AddTransient<IncidenceReportsViewModel>();
            services.AddTransient<AddIncidenceReportViewModel>();
            services.AddTransient<IncidenceReportDetailsViewModel>();
            services.AddTransient<ShiftDiariesViewModel>();
            services.AddTransient<AddShiftDiaryViewModel>();
            services.AddTransient<ShiftDiaryDetailsViewModel>();
            services.AddTransient<SettingsViewModel>();
            services.AddTransient<LoginViewModel>();
            services.AddTransient<MainWindowViewModel>();
            return services;
        }
    }
}