using System;

namespace SAPLDesktopApp.Services
{
    public class ApiConfigurationService : IApiConfigurationService
    {
        private string _baseUrl = "https://anemosnguyen2409.southeastasia.cloudapp.azure.com"; // Default base URL

        public string BaseUrl => _baseUrl;

        public void SetBaseUrl(string baseUrl)
        {
            _baseUrl = baseUrl?.TrimEnd('/') ?? throw new ArgumentNullException(nameof(baseUrl));
        }
    }
}