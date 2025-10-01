using SAPLSServer.Constants;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;

namespace SAPLSServer.Services.Implementations
{
    public class PaymentPayOsSettings : IPaymentSettings
    {
        private readonly string _paymentGatewayUrl;
        private readonly string _paymentGatewayApiKey;
        private readonly string _paymentGatewayClientKey;
        private readonly string _paymentGatewayCheckSumKey;
        public PaymentPayOsSettings(IConfiguration configuration)
        {
            _paymentGatewayUrl = configuration[ConfigurationConstants.PayOsApiBaseUrl]
                ?? throw new EmptyConfigurationValueException();
            _paymentGatewayApiKey = configuration[ConfigurationConstants.PayOsApiKey] 
                ?? throw new EmptyConfigurationValueException();
            _paymentGatewayClientKey = configuration[ConfigurationConstants.PayOsClientKey]
                ?? throw new EmptyConfigurationValueException();
            _paymentGatewayCheckSumKey = configuration[ConfigurationConstants.PayOsCheckSumKey]
                ?? throw new EmptyConfigurationValueException();

        }
        public string PaymentGatewayUrl => _paymentGatewayUrl;

        public string PaymentGatewayApiKey => _paymentGatewayApiKey;

        public string PaymentGatewayClientKey => _paymentGatewayClientKey;

        public string PaymentGatewayCheckSumKey => _paymentGatewayCheckSumKey;
    }
}
