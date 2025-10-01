using Microsoft.AspNetCore.Mvc;
using SAPLSServer.DTOs.Concrete.OcrDtos;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace SAPLSServer.Controllers
{
    [ApiController]
    [Route("api/ocr/vehicle-registration")]
    public class VehicleRegistrationCertOcrController : ControllerBase
    {
        private readonly IVehicleRegistrationCertOcrService _ocrService;
        private readonly ILogger<VehicleRegistrationCertOcrController> _logger;

        public VehicleRegistrationCertOcrController(IVehicleRegistrationCertOcrService ocrService, ILogger<VehicleRegistrationCertOcrController> logger)
        {
            _ocrService = ocrService;
            _logger = logger;
        }

        [HttpPost("base64")]
        public async Task<ActionResult<VehicleRegistrationOcrResponse>> ExtractFromBase64([FromBody] VehicleRegistrationOcrRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in ExtractFromBase64: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _ocrService.AttractDataFromBase64(request);
                return Ok(result);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided in OCR base64 request");
                return BadRequest(ex.Message);
            }
            catch (EmptyConfigurationValueException ex)
            {
                _logger.LogError(ex, "OCR service configuration is missing or invalid in ExtractFromBase64");
                return StatusCode(503, new
                {
                    ErrorMessage = ex.Message,
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred during OCR base64 processing");
                return StatusCode(500, new
                {
                    ErrorMessage = ex.Message
                });
            }
        }

        [HttpPost("file")]
        [RequestSizeLimit(10_000_000)] // 10MB limit, adjust as needed
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<VehicleRegistrationOcrResponse>> ExtractFromFile([FromForm] VehicleRegistrationOcrFileRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state in ExtractFromFile: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var result = await _ocrService.AttractDataFromFile(request);
                return Ok(result);
            }
            catch (InvalidInformationException ex)
            {
                _logger.LogWarning(ex, "Invalid information provided in OCR file request");
                return BadRequest(ex.Message);
            }
            catch (EmptyConfigurationValueException ex)
            {
                _logger.LogError(ex, "OCR service configuration is missing or invalid in ExtractFromFile");
                return StatusCode(503, new
                {
                    ErrorMessage = ex.Message,
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred during OCR file processing");
                return StatusCode(500, new
                {
                    ErrorMessage = ex.Message
                });
            }
        }
    }
}