using SAPLSServer.DTOs.Concrete.FileUploadDtos;

namespace SAPLSServer.Services.Interfaces
{
    public interface IFileService
    {
        /// <summary>
        /// Uploads a single file to Azure Blob Storage
        /// </summary>
        /// <param name="request">File upload request</param>
        /// <returns>File upload response with details</returns>
        Task<FileUploadResponse> UploadFileAsync(FileUploadRequest request);

        /// <summary>
        /// Uploads multiple files to Azure Blob Storage
        /// </summary>
        /// <param name="request">Multiple file upload request</param>
        /// <returns>List of file upload responses</returns>
        Task<List<FileUploadResponse>> UploadMultipleFilesAsync(MultipleFileUploadRequest request);

        /// <summary>
        /// Downloads a file from Azure Blob Storage
        /// </summary>
        /// <param name="fileName">The file name in storage</param>
        /// <param name="container">Optional container name</param>
        /// <returns>File download response with stream</returns>
        Task<FileDownloadResponse?> DownloadFileAsync(string fileName, string? container = null);

        /// <summary>
        /// Downloads a file by its full URL
        /// </summary>
        /// <param name="fileUrl">The full URL of the file</param>
        /// <returns>File download response with stream</returns>
        Task<FileDownloadResponse?> DownloadFileByUrlAsync(string fileUrl);

        /// <summary>
        /// Deletes a file from Azure Blob Storage
        /// </summary>
        /// <param name="fileName">The file name in storage</param>
        /// <param name="container">Optional container name</param>
        /// <returns>True if deleted successfully</returns>
        Task<bool> DeleteFileAsync(string fileName, string? container = null);

        /// <summary>
        /// Deletes a file by its full URL
        /// </summary>
        /// <param name="fileUrl">The full URL of the file</param>
        /// <returns>True if deleted successfully</returns>
        Task<bool> DeleteFileByUrlAsync(string fileUrl);

        /// <summary>
        /// Gets file information without downloading
        /// </summary>
        /// <param name="fileName">The file name in storage</param>
        /// <param name="container">Optional container name</param>
        /// <returns>File information or null if not found</returns>
        Task<FileUploadResponse?> GetFileInfoAsync(string fileName, string? container = null);

        /// <summary>
        /// Checks if a file exists in storage
        /// </summary>
        /// <param name="fileName">The file name in storage</param>
        /// <param name="container">Optional container name</param>
        /// <returns>True if file exists</returns>
        Task<bool> FileExistsAsync(string fileName, string? container = null);

        /// <summary>
        /// Lists all files in a container
        /// </summary>
        /// <param name="container">Optional container name</param>
        /// <param name="prefix">Optional prefix to filter files</param>
        /// <returns>List of file information</returns>
        Task<List<FileUploadResponse>> ListFilesAsync(string? container = null, string? prefix = null);

        /// <summary>
        /// Generates a secure URL for temporary file access
        /// </summary>
        /// <param name="fileName">The file name in storage</param>
        /// <param name="expirationTime">URL expiration time</param>
        /// <param name="container">Optional container name</param>
        /// <returns>Secure URL with expiration</returns>
        string GenerateSecureUrlAsync(string fileName, TimeSpan expirationTime, string? container = null);
    }
}