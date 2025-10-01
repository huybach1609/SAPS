using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using SAPLSServer.DTOs.Concrete.FileUploadDtos;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace SAPLSServer.Services.Implementations
{
    public class AzureBlobFileService : IFileService
    {
        private readonly BlobServiceClient _blobServiceClient;
        private readonly IAzureBlobStorageSettings _settings;
        private readonly ILogger<AzureBlobFileService> _logger;

        public AzureBlobFileService(
            BlobServiceClient blobServiceClient,
            IAzureBlobStorageSettings settings,
            ILogger<AzureBlobFileService> logger)
        {
            _blobServiceClient = blobServiceClient;
            _settings = settings;
            _logger = logger;
        }

        public async Task<FileUploadResponse> UploadFileAsync(FileUploadRequest request)
        {
            try
            {
                if (request.File == null || request.File.Length == 0)
                    throw new InvalidInformationException("File is required and cannot be empty");

                var containerName = request.Container ?? _settings.DefaultContainer;
                var containerClient = await GetOrCreateContainerAsync(containerName);

                var fileName = GenerateFileName(request.File.FileName, request.GenerateUniqueFileName, request.SubFolder);
                var blobClient = containerClient.GetBlobClient(fileName);

                // Calculate file hash
                var fileHash = await CalculateFileHashAsync(request.File);

                // Set blob metadata
                var metadata = request.Metadata ?? new Dictionary<string, string>();
                metadata["OriginalFileName"] = request.File.FileName;
                metadata["UploadedAt"] = DateTime.UtcNow.ToString("O");
                metadata["FileHash"] = fileHash;

                // Set blob headers
                var blobHttpHeaders = new BlobHttpHeaders
                {
                    ContentType = request.File.ContentType ?? "application/octet-stream"
                };

                // Upload file
                using var stream = request.File.OpenReadStream();
                var uploadResult = await blobClient.UploadAsync(
                    stream,
                    new BlobUploadOptions
                    {
                        HttpHeaders = blobHttpHeaders,
                        Metadata = metadata
                    });

                _logger.LogInformation("File uploaded successfully: {FileName} to container: {Container}", fileName, containerName);

                return new FileUploadResponse
                {
                    FileId = Guid.NewGuid().ToString(),
                    FileName = fileName,
                    OriginalFileName = request.File.FileName,
                    CloudUrl = blobClient.Uri.ToString(),
                    CdnUrl = blobClient.Uri.ToString(), // You can implement CDN URL logic here
                    FileSize = request.File.Length,
                    FileExtension = Path.GetExtension(request.File.FileName),
                    ContentType = request.File.ContentType ?? "application/octet-stream",
                    FileHash = fileHash,
                    UploadedAt = DateTime.UtcNow,
                    Container = containerName
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file: {FileName}", request.File?.FileName);
                throw new InvalidInformationException($"Failed to upload file: {ex.Message}");
            }
        }

        public async Task<List<FileUploadResponse>> UploadMultipleFilesAsync(MultipleFileUploadRequest request)
        {
            var results = new List<FileUploadResponse>();

            foreach (var file in request.Files)
            {
                var singleRequest = new FileUploadRequest
                {
                    File = file,
                    Container = request.Container,
                    SubFolder = request.SubFolder,
                    GenerateUniqueFileName = request.GenerateUniqueFileName,
                    Metadata = request.Metadata
                };

                var result = await UploadFileAsync(singleRequest);
                results.Add(result);
            }

            return results;
        }

        public async Task<FileDownloadResponse?> DownloadFileAsync(string fileName, string? container = null)
        {
            try
            {
                var containerName = container ?? _settings.DefaultContainer;
                var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
                var blobClient = containerClient.GetBlobClient(fileName);

                var exists = await blobClient.ExistsAsync();
                if (!exists.Value)
                    return null;

                var properties = await blobClient.GetPropertiesAsync();
                var downloadInfo = await blobClient.DownloadStreamingAsync();

                return new FileDownloadResponse
                {
                    FileStream = downloadInfo.Value.Content,
                    FileName = fileName,
                    ContentType = properties.Value.ContentType,
                    FileSize = properties.Value.ContentLength
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading file: {FileName} from container: {Container}", fileName, container);
                return null;
            }
        }

        public async Task<FileDownloadResponse?> DownloadFileByUrlAsync(string fileUrl)
        {
            try
            {
                var (containerName, fileName) = ParseBlobUrl(fileUrl);
                return await DownloadFileAsync(fileName, containerName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading file by URL: {FileUrl}", fileUrl);
                return null;
            }
        }

        public async Task<bool> DeleteFileAsync(string fileName, string? container = null)
        {
            try
            {
                var containerName = container ?? _settings.DefaultContainer;
                var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
                var blobClient = containerClient.GetBlobClient(fileName);

                var response = await blobClient.DeleteIfExistsAsync();

                if (response.Value)
                    _logger.LogInformation("File deleted successfully: {FileName} from container: {Container}", fileName, containerName);

                return response.Value;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file: {FileName} from container: {Container}", fileName, container);
                return false;
            }
        }

        public async Task<bool> DeleteFileByUrlAsync(string fileUrl)
        {
            try
            {
                var (containerName, fileName) = ParseBlobUrl(fileUrl);
                return await DeleteFileAsync(fileName, containerName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file by URL: {FileUrl}", fileUrl);
                return false;
            }
        }

        public async Task<FileUploadResponse?> GetFileInfoAsync(string fileName, string? container = null)
        {
            try
            {
                var containerName = container ?? _settings.DefaultContainer;
                var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
                var blobClient = containerClient.GetBlobClient(fileName);

                var exists = await blobClient.ExistsAsync();
                if (!exists.Value)
                    return null;

                var properties = await blobClient.GetPropertiesAsync();


                return new FileUploadResponse
                {
                    FileId = properties.Value.Metadata.TryGetValue("FileId", out var fileId) ? fileId : Guid.NewGuid().ToString(),
                    FileName = fileName,
                    OriginalFileName = properties.Value.Metadata.TryGetValue("OriginalFileName", out var originalFileName) ? originalFileName : fileName,
                    CloudUrl = blobClient.Uri.ToString(),
                    CdnUrl = blobClient.Uri.ToString(),
                    FileSize = properties.Value.ContentLength,
                    FileExtension = Path.GetExtension(fileName),
                    ContentType = properties.Value.ContentType,
                    FileHash = properties.Value.Metadata.TryGetValue("FileHash", out var fileHash) ? fileHash : string.Empty,
                    UploadedAt = properties.Value.LastModified.DateTime,
                    Container = containerName
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting file info: {FileName} from container: {Container}", fileName, container);
                return null;
            }
        }

        public async Task<bool> FileExistsAsync(string fileName, string? container = null)
        {
            try
            {
                var containerName = container ?? _settings.DefaultContainer;
                var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
                var blobClient = containerClient.GetBlobClient(fileName);

                var exists = await blobClient.ExistsAsync();
                return exists.Value;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking file existence: {FileName} from container: {Container}", fileName, container);
                return false;
            }
        }

        public async Task<List<FileUploadResponse>> ListFilesAsync(string? container = null, string? prefix = null)
        {
            try
            {
                var containerName = container ?? _settings.DefaultContainer;
                var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);

                var files = new List<FileUploadResponse>();

                await foreach (var blobItem in containerClient.GetBlobsAsync(prefix: prefix))
                {
                    var blobClient = containerClient.GetBlobClient(blobItem.Name);

                    files.Add(new FileUploadResponse
                    {
                        FileId = blobItem.Metadata != null && blobItem.Metadata.ContainsKey("FileId")
        ? blobItem.Metadata["FileId"]
        : Guid.NewGuid().ToString(),
                        FileName = blobItem.Name,
                        OriginalFileName = blobItem.Metadata != null && blobItem.Metadata.ContainsKey("OriginalFileName")
        ? blobItem.Metadata["OriginalFileName"]
        : blobItem.Name,
                        CloudUrl = blobClient.Uri.ToString(),
                        CdnUrl = blobClient.Uri.ToString(),
                        FileSize = blobItem.Properties.ContentLength ?? 0,
                        FileExtension = Path.GetExtension(blobItem.Name),
                        ContentType = blobItem.Properties.ContentType ?? "application/octet-stream",
                        FileHash = blobItem.Metadata != null && blobItem.Metadata.ContainsKey("FileHash")
        ? blobItem.Metadata["FileHash"]
        : string.Empty,
                        UploadedAt = blobItem.Properties.LastModified?.DateTime ?? DateTime.UtcNow,
                        Container = containerName
                    });
                }

                return files;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error listing files from container: {Container}", container);
                return new List<FileUploadResponse>();
            }
        }

        public string GenerateSecureUrlAsync(string fileName, TimeSpan expirationTime, string? container = null)
        {
            try
            {
                var containerName = container ?? _settings.DefaultContainer;
                var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
                var blobClient = containerClient.GetBlobClient(fileName);

                if (!blobClient.CanGenerateSasUri)
                    throw new InvalidOperationException("Cannot generate SAS URI. Ensure the storage account has the necessary permissions.");

                var sasBuilder = new BlobSasBuilder
                {
                    BlobContainerName = containerName,
                    BlobName = fileName,
                    Resource = "b",
                    ExpiresOn = DateTimeOffset.UtcNow.Add(expirationTime)
                };

                sasBuilder.SetPermissions(BlobSasPermissions.Read);

                return blobClient.GenerateSasUri(sasBuilder).ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating secure URL for file: {FileName}", fileName);
                throw new InvalidInformationException($"Failed to generate secure URL: {ex.Message}");
            }
        }

        #region Private Helper Methods

        private async Task<BlobContainerClient> GetOrCreateContainerAsync(string containerName)
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);
            return containerClient;
        }

        private static string GenerateFileName(string originalFileName, bool generateUnique, string? subFolder = null)
        {
            if (!generateUnique)
            {
                return string.IsNullOrWhiteSpace(subFolder)
                    ? originalFileName
                    : $"{subFolder}/{originalFileName}";
            }

            var extension = Path.GetExtension(originalFileName);
            var nameWithoutExtension = Path.GetFileNameWithoutExtension(originalFileName);
            var uniqueName = $"{nameWithoutExtension}_{Guid.NewGuid():N}{extension}";

            return string.IsNullOrWhiteSpace(subFolder)
                ? uniqueName
                : $"{subFolder}/{uniqueName}";
        }

        private static async Task<string> CalculateFileHashAsync(IFormFile file)
        {
            using var sha256 = SHA256.Create();
            using var stream = file.OpenReadStream();
            var hashBytes = await Task.Run(() => sha256.ComputeHash(stream));
            return Convert.ToHexString(hashBytes).ToLowerInvariant();
        }

        private (string containerName, string fileName) ParseBlobUrl(string blobUrl)
        {
            var uri = new Uri(blobUrl);
            var segments = uri.AbsolutePath.TrimStart('/').Split('/', 2);

            if (segments.Length != 2)
                throw new ArgumentException("Invalid blob URL format", nameof(blobUrl));

            return (segments[0], segments[1]);
        }

        #endregion
    }
}