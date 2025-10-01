using SAPLSServer.DTOs.Concrete.AttachedFileDtos;
using SAPLSServer.DTOs.Concrete.FileUploadDtos;
using System.Threading.Tasks;

namespace SAPLSServer.Services.Interfaces
{
    public interface IIncidenceEvidenceService
    {
        Task AddAsync(string incidentReportId, FileUploadResponse fileUploadResponse);
        Task<List<GetAttachedFileDto>?> GetAttachedFilesByIncidentReportId(string incidentReportId);
    }
}