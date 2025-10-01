namespace SAPLSServer.Services.Interfaces
{
    public interface ICitizenCardOcrSettings
    {
        /// <summary>
        /// The base URL for the OCR service, used to construct API endpoints.
        /// </summary>
        string OcrBaseUrl { get; }
        /// <summary>
        /// The name of the OCR model to use, which may determine the specific capabilities or features of the OCR service.
        /// </summary>
        string OcrModelName { get; }
        /// <summary>
        /// The API key for the OCR service, used for authentication and authorization.
        /// </summary>
        string OcrApiKey { get; }
    }
}