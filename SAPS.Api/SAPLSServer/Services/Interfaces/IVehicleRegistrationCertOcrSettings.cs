namespace SAPLSServer.Services.Interfaces
{
    public interface IVehicleRegistrationCertOcrSettings
    {
        /// <summary>
        /// 
        /// </summary>
        string OcrBaseUrl { get; }
        /// <summary>
        /// 
        /// </summary>
        string OcrModelName { get; }
        /// <summary>
        /// 
        /// </summary>
        string OcrApiKey { get; }
    }
}
