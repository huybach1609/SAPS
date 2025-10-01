namespace SAPLSServer.Services.Interfaces
{
    public interface IPaymentSettings
    {
        /// <summary>
        /// Provides the URL for the payment gateway.
        /// </summary>
        public string PaymentGatewayUrl { get; }
        /// <summary>
        /// Api key for the payment gateway.
        /// </summary>
        public string PaymentGatewayApiKey { get; }
        /// <summary>
        /// Client key for the payment gateway.
        /// </summary>
        public string PaymentGatewayClientKey { get; }
        /// <summary>
        /// Checksum key for the payment gateway.
        /// </summary>
        public string PaymentGatewayCheckSumKey { get; }
    }
}
