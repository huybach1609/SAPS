using Microsoft.AspNetCore.Mvc.ModelBinding;
using SAPLSServer.Constants;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;

namespace SAPLSServer.Services.Implementations
{
    public class CitizenCardGeminiOcrSettings : ICitizenCardOcrSettings
    {
        private readonly string _baseUrl;
        private readonly string _modelName;
        private readonly string _apiKey;
        public CitizenCardGeminiOcrSettings(IConfiguration configuration)
        {
            _baseUrl = configuration[ConfigurationConstants.GeminiOcrBaseUrl] ?? throw new EmptyConfigurationValueException();
            _modelName = configuration[ConfigurationConstants.GeminiOcrModelName] ?? throw new EmptyConfigurationValueException();
            _apiKey = configuration[ConfigurationConstants.GeminiOcrApiKey] ?? throw new EmptyConfigurationValueException();
        }
        public string OcrBaseUrl => _baseUrl;

        public string OcrModelName => _modelName;

        public string OcrApiKey => _apiKey;
    }
}
