using SAPLSServer.Constants;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;

namespace SAPLSServer.Services.Implementations
{
    public class AzureBlobStorageSettings : IAzureBlobStorageSettings
    {
        private readonly string _accountName;
        private readonly string _accessKey;
        private readonly string _connectionString;
        private readonly string _defaultContainer;

        public AzureBlobStorageSettings(IConfiguration configuration)
        {
            _accountName = configuration[ConfigurationConstants.AzureBlobStorageAccountName] 
                ?? throw new EmptyConfigurationValueException(ConfigurationConstants.AzureBlobStorageAccountName);
            
            _accessKey = configuration[ConfigurationConstants.AzureBlobStorageAccessKey] 
                ?? throw new EmptyConfigurationValueException(ConfigurationConstants.AzureBlobStorageAccessKey);

            // Build connection string if not provided directly
            var connectionString = configuration[ConfigurationConstants.AzureBlobStorageConnectionString];
            _connectionString = !string.IsNullOrWhiteSpace(connectionString) 
                ? connectionString 
                : $"DefaultEndpointsProtocol=https;AccountName={_accountName};AccountKey={_accessKey};EndpointSuffix=core.windows.net";

            _defaultContainer = configuration[ConfigurationConstants.AzureBlobStorageDefaultContainer] ?? "files";
        }

        public string AccountName => _accountName;
        public string AccessKey => _accessKey;
        public string ConnectionString => _connectionString;
        public string DefaultContainer => _defaultContainer;
    }
}