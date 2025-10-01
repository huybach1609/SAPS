using SAPLSServer.DTOs.Concrete.OcrDtos;

namespace SAPLSServer.Services.Interfaces
{
    public interface IVehicleRegistrationCertOcrService
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        Task<VehicleRegistrationOcrResponse> AttractDataFromFile(VehicleRegistrationOcrFileRequest request);
        /// <summary>
        /// 
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        Task<VehicleRegistrationOcrResponse> AttractDataFromBase64(VehicleRegistrationOcrRequest request);
    }
}
