using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using SAPLSServer.Services.Interfaces;
using SAPLSServer.DTOs.Concrete.FileUploadDtos;
using SAPLSServer.DTOs.Concrete.AttachedFileDtos;


namespace SAPLSServer.Services.Implementations
{
    public class RequestAttachedFileService : IRequestAttachedFileService
    {
        private readonly IRequestAttachedFileRepository _requestAttachedFileRepository;
        private readonly IAttachedFileRepository _attachedFileRepository;

        public RequestAttachedFileService(
            IRequestAttachedFileRepository requestAttachedFileRepository,
            IAttachedFileRepository attachedFileRepository)
        {
            _requestAttachedFileRepository = requestAttachedFileRepository;
            _attachedFileRepository = attachedFileRepository;
        }

        public async Task AddAsync(string requestId, FileUploadResponse fileUploadResponse)
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

            var requestAttachedFile = new RequestAttachedFile
            {
                AttachedFileId = attachedFile.Id,
                RequestId = requestId
            };
            await _requestAttachedFileRepository.AddAsync(requestAttachedFile);

            await _attachedFileRepository.SaveChangesAsync();
            await _requestAttachedFileRepository.SaveChangesAsync();
        }

        public async Task<List<GetAttachedFileDto>?> GetAttachedFilesByRequestId(string requestId)
        {
            // Get all RequestAttachedFile for the request, including the AttachedFile navigation property
            var requestFiles = await _requestAttachedFileRepository
                .GetAllAsync([raf => raf.RequestId == requestId]);
            if (requestFiles == null || !requestFiles.Any())
                return new List<GetAttachedFileDto>();
            var attachedFiles = new List<GetAttachedFileDto>();
            foreach (var requestFile in requestFiles)
            {
                var attachedFile = await _requestAttachedFileRepository
                    .FindIncludeAttachedFileReadonly(requestFile.AttachedFileId);
                if(attachedFile != null)
                {
                    attachedFiles.Add(new GetAttachedFileDto(attachedFile.AttachedFile));
                }
            }

            return attachedFiles;
        }
    }
}