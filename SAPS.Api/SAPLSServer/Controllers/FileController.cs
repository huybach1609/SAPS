using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.FileUploadDtos;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;

namespace SAPLSServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FileController : ControllerBase
    {
        private readonly IFileService _fileService;
        private readonly ILogger<FileController> _logger;

        public FileController(IFileService fileService, ILogger<FileController> logger)
        {
            _fileService = fileService;
            _logger = logger;
        }

        /// <summary>
        /// Upload a single file to Azure Blob Storage
        /// </summary>
        /// <param name="request">File upload request</param>
        /// <returns>File upload response with details</returns>
        [HttpPost("upload")]
        [RequestSizeLimit(50_000_000)] // 50MB limit
        public async Task<ActionResult<FileUploadResponse>> UploadFile([FromForm] FileUploadRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in UploadFile: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _fileService.UploadFileAsync(request);
                return Ok(result);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided in file upload request");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while uploading file");
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = MessageKeys.FILE_UPLOAD_FAILED });
            }
        }

        /// <summary>
        /// Upload multiple files to Azure Blob Storage
        /// </summary>
        /// <param name="request">Multiple file upload request</param>
        /// <returns>List of file upload responses</returns>
        [HttpPost("upload/multiple")]
        [RequestSizeLimit(200_000_000)] // 200MB limit for multiple files
        public async Task<ActionResult<List<FileUploadResponse>>> UploadMultipleFiles([FromForm] MultipleFileUploadRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in UploadMultipleFiles: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var results = await _fileService.UploadMultipleFilesAsync(request);
                return Ok(results);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided in multiple file upload request");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while uploading multiple files");
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = MessageKeys.MULTIPLE_FILE_UPLOAD_FAILED });
            }
        }

        /// <summary>
        /// Download a file from Azure Blob Storage
        /// </summary>
        /// <param name="fileName">The file name in storage</param>
        /// <param name="container">Optional container name</param>
        /// <returns>File download stream</returns>
        [HttpGet("download/{fileName}")]
        public async Task<IActionResult> DownloadFile(string fileName, [FromQuery] string? container = null)
        {
            try
            {
                var result = await _fileService.DownloadFileAsync(fileName, container);
                
                if (result == null)
                {
                    _logger.LogInformation("File not found for download: {FileName}, Container: {Container}", fileName, container);
                    return NotFound(new { message = MessageKeys.FILE_NOT_FOUND });
                }

                return File(result.FileStream, result.ContentType, result.FileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while downloading file: {FileName}", fileName);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = MessageKeys.FILE_DOWNLOAD_FAILED });
            }
        }

        /// <summary>
        /// Delete a file from Azure Blob Storage
        /// </summary>
        /// <param name="fileName">The file name in storage</param>
        /// <param name="container">Optional container name</param>
        /// <returns>Success response</returns>
        [HttpDelete("{fileName}")]
        public async Task<IActionResult> DeleteFile(string fileName, [FromQuery] string? container = null)
        {
            try
            {
                var success = await _fileService.DeleteFileAsync(fileName, container);
                
                if (!success)
                {
                    _logger.LogInformation("File not found or could not be deleted: {FileName}, Container: {Container}", fileName, container);
                    return NotFound(new { message = MessageKeys.FILE_NOT_FOUND_OR_COULD_NOT_BE_DELETED });
                }

                return Ok(new { message = MessageKeys.FILE_DELETED_SUCCESSFULLY });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting file: {FileName}", fileName);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = MessageKeys.FILE_DELETION_FAILED });
            }
        }

        /// <summary>
        /// Get file information without downloading
        /// </summary>
        /// <param name="fileName">The file name in storage</param>
        /// <param name="container">Optional container name</param>
        /// <returns>File information</returns>
        [HttpGet("info/{fileName}")]
        public async Task<ActionResult<FileUploadResponse>> GetFileInfo(string fileName, [FromQuery] string? container = null)
        {
            try
            {
                var result = await _fileService.GetFileInfoAsync(fileName, container);
                
                if (result == null)
                {
                    _logger.LogInformation("File info not found: {FileName}, Container: {Container}", fileName, container);
                    return NotFound(new { message = MessageKeys.FILE_NOT_FOUND });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving file information for: {FileName}", fileName);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = MessageKeys.FAILED_TO_GET_FILE_INFORMATION });
            }
        }

        /// <summary>
        /// List all files in a container
        /// </summary>
        /// <param name="container">Optional container name</param>
        /// <param name="prefix">Optional prefix to filter files</param>
        /// <returns>List of file information</returns>
        [HttpGet("list")]
        public async Task<ActionResult<List<FileUploadResponse>>> ListFiles([FromQuery] string? container = null, [FromQuery] string? prefix = null)
        {
            try
            {
                var results = await _fileService.ListFilesAsync(container, prefix);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while listing files in container: {Container} with prefix: {Prefix}", container, prefix);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = MessageKeys.FAILED_TO_LIST_FILES });
            }
        }

        /// <summary>
        /// Generate a secure URL for temporary file access
        /// </summary>
        /// <param name="fileName">The file name in storage</param>
        /// <param name="expirationHours">URL expiration time in hours (default: 1 hour)</param>
        /// <param name="container">Optional container name</param>
        /// <returns>Secure URL</returns>
        [HttpGet("secure-url/{fileName}")]
        public ActionResult<object> GenerateSecureUrl(string fileName, [FromQuery] int expirationHours = 1, [FromQuery] string? container = null)
        {
            try
            {
                var expirationTime = TimeSpan.FromHours(Math.Max(1, Math.Min(24, expirationHours))); // Limit between 1-24 hours
                var secureUrl = _fileService.GenerateSecureUrlAsync(fileName, expirationTime, container);
                
                return Ok(new { 
                    url = secureUrl, 
                    expiresAt = DateTime.UtcNow.Add(expirationTime),
                    expirationHours = expirationTime.TotalHours
                });
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided while generating secure URL for file: {FileName}", fileName);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while generating secure URL for file: {FileName}", fileName);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { message = MessageKeys.FAILED_TO_GENERATE_SECURE_URL });
            }
        }
    }
}