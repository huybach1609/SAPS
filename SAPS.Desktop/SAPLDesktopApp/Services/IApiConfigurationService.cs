namespace SAPLDesktopApp.Services
{
    public interface IApiConfigurationService
    {
        string BaseUrl { get; }
        void SetBaseUrl(string baseUrl);
    }
}