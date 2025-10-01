using SAPLSServer.DTOs.Concrete.AttachedFileDtos;
using SAPLSServer.DTOs.Concrete.FileUploadDtos;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using SAPLSServer.Services.Interfaces;
using System.Threading.Tasks;

namespace SAPLSServer.Services.Implementations
{
    public class IncidenceEvidenceService : IIncidenceEvidenceService
    {
        private readonly IIncidenceEvidenceRepository _incidenceEvidenceRepository;
        private readonly IAttachedFileRepository _attachedFileRepository;

        public IncidenceEvidenceService(
            IIncidenceEvidenceRepository incidenceEvidenceRepository,
            IAttachedFileRepository attachedFileRepository)
        {
            _incidenceEvidenceRepository = incidenceEvidenceRepository;
            _attachedFileRepository = attachedFileRepository;
        }

        public async Task AddAsync(string incidentReportId, FileUploadResponse fileUploadResponse)
        {
            var attachedFile = new AttachedFile
            {
                Id = fileUploadResponse.FileId,
                CloudUrl = fileUploadResponse.CloudUrl,
                CdnUrl = fileUploadResponse.CdnUrl,
                OriginalFileName = fileUploadResponse.OriginalFileName,
                StorageFileName = fileUploadResponse.FileName,
                FileSize = fileUploadResponse.FileSize,
                FileExtension = fileUploadResponse.FileExtension,
                FileHash = fileUploadResponse.FileHash,
                UploadAt = fileUploadResponse.UploadedAt
            };
            await _attachedFileRepository.AddAsync(attachedFile);

            var evidence = new IncidenceEvidence
            {
                AttachedFileId = attachedFile.Id,
                IncidenceReportId = incidentReportId
            };
            await _incidenceEvidenceRepository.AddAsync(evidence);

            await _attachedFileRepository.SaveChangesAsync();
            await _incidenceEvidenceRepository.SaveChangesAsync();
        }
        public async Task<List<GetAttachedFileDto>?> GetAttachedFilesByIncidentReportId(string incidentReportId)
        {
            var evidences = await _incidenceEvidenceRepository
                .GetAllAsync([ie => ie.IncidenceReportId == incidentReportId]);
            if (evidences == null || !evidences.Any())
                return new List<GetAttachedFileDto>();
            var attachedFiles = new List<GetAttachedFileDto>();
            foreach (var evidence in evidences)
            {
                var attachedFile = await _incidenceEvidenceRepository
                    .FindIncludeAttachedFileReadonly(evidence.AttachedFileId);
                if (attachedFile != null)
                {
                    attachedFiles.Add(new GetAttachedFileDto(attachedFile.AttachedFile));
                }
            }
            return attachedFiles;
        }
    }
}