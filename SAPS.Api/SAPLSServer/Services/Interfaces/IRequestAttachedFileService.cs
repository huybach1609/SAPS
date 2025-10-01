using SAPLSServer.DTOs.Concrete.AttachedFileDtos;
using SAPLSServer.DTOs.Concrete.FileUploadDtos;
using System.Threading.Tasks;

namespace SAPLSServer.Services.Interfaces
{
    public interface IRequestAttachedFileService
    {
        Task AddAsync(string requestId, FileUploadResponse fileUploadResponse);
        Task<List<GetAttachedFileDto>?> GetAttachedFilesByRequestId(string requestId);
    }
}