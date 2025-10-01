using SAPLSServer.DTOs.Concrete.OcrDtos;

namespace SAPLSServer.Services.Interfaces
{
    public interface ICitizenCardOcrService
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        Task<CitizenIdOcrResponse> ExtractDataFromFile(CitizenIdOcrFileRequest request);
        /// <summary>
        /// 
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        Task<CitizenIdOcrResponse> ExtractDataFromBase64(CitizenIdOcrRequest request);
    }
}
