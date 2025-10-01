using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.OcrDtos;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;
using System.Globalization;
using System.Text.Json;

namespace SAPLSServer.Services.Implementations
{
    public class CitizenCardGeminiOcrService : ICitizenCardOcrService
    {
        private readonly IHttpClientService _httpClientService;
        private readonly IPromptProviderService _promptProviderService;
        private readonly string _baseUrl;
        private readonly string _modelName;
        private readonly string _apiKey;

        public CitizenCardGeminiOcrService(IPromptProviderService promptProviderService,
            ILogger<CitizenCardGeminiOcrService> logger,
            IHttpClientService httpClientService,
            ICitizenCardOcrSettings settings)
        {
            _promptProviderService = promptProviderService;
            _httpClientService = httpClientService;
            _baseUrl = settings.OcrBaseUrl;
            _modelName = settings.OcrModelName;
            _apiKey = settings.OcrApiKey;
        }

        public async Task<CitizenIdOcrResponse> ExtractDataFromBase64(CitizenIdOcrRequest request)
        {
            var geminiRequest = CreateStructuredGeminiRequest(_promptProviderService.CitizenCardPrompt, request.FrontImageBase64, 
                request.BackImageBase64, request.FrontImageFormat, request.BackImageFormat);
            var url = $"{_baseUrl}/models/{_modelName}:generateContent?key={_apiKey}";

            var response = await _httpClientService.PostAsync(url, JsonSerializer.Serialize(geminiRequest));

            if (string.IsNullOrWhiteSpace(response))
            {
                throw new InvalidOperationException(MessageKeys.GEMINI_OCR_SERVICE_IS_UNAVAILABLE);
            }

            return ExtractStructuredResponse(response);
        }

        public async Task<CitizenIdOcrResponse> ExtractDataFromFile(CitizenIdOcrFileRequest request)
        {
            if (request.FrontImage == null || request.BackImage == null)
            {
                throw new InvalidInformationException();
            }

            var (frontImageBase64, frontMimeType) = await GetImageAsBase64Async(request.FrontImage);
            var (backImageBase64, backMimeType) = await GetImageAsBase64Async(request.BackImage);

            var base64Request = new CitizenIdOcrRequest
            {
                FrontImageBase64 = frontImageBase64,
                BackImageBase64 = backImageBase64,
                FrontImageFormat = frontMimeType.Replace("image/", ""),
                BackImageFormat = backMimeType.Replace("image/", "")
            };

            return await ExtractDataFromBase64(base64Request);
        }

        private static object CreateStructuredGeminiRequest(string prompt, string frontImageBase64, string backImageBase64, 
            string frontImageFormat, string backImageFormat)
        {
            var imageParts = new List<object>
            {
                new { text = prompt },
                new
                {
                    inline_data = new
                    {
                        mime_type = $"image/{frontImageFormat}",
                        data = frontImageBase64
                    }
                }
            };

            if (!string.IsNullOrWhiteSpace(backImageBase64))
            {
                imageParts.Add(new
                {
                    inline_data = new
                    {
                        mime_type = $"image/{backImageFormat}",
                        data = backImageBase64
                    }
                });
            }

            return new
            {
                contents = new[]
                {
                    new { parts = imageParts.ToArray() }
                },
                generationConfig = new
                {
                    temperature = 0.1,
                    topK = 32,
                    topP = 1,
                    maxOutputTokens = 2048,
                    responseMimeType = "application/json",
                    responseSchema = new
                    {
                        type = "object",
                        properties = new
                        {
                            success = new
                            {
                                type = "boolean",
                                description = "Whether extraction was successful"
                            },
                            extractedData = new
                            {
                                type = "object",
                                properties = new
                                {
                                    citizenId = new
                                    {
                                        type = "string",
                                        description = "12-digit citizen ID without dashes"
                                    },
                                    fullName = new
                                    {
                                        type = "string",
                                        description = "Full name in ALL UPPERCASE as printed"
                                    },
                                    dateOfBirth = new
                                    {
                                        type = "string",
                                        description = "Date of birth in DD/MM/YYYY format"
                                    },
                                    sex = new
                                    {
                                        type = "string",
                                        description = "Gender: Male or Female"
                                    },
                                    nationality = new
                                    {
                                        type = "string",
                                        description = "Nationality as written on card"
                                    },
                                    placeOfOrigin = new
                                    {
                                        type = "string",
                                        description = "Place of origin/birth"
                                    },
                                    placeOfResidence = new
                                    {
                                        type = "string",
                                        description = "Current residence address"
                                    },
                                    expiryDate = new
                                    {
                                        type = "string",
                                        description = "Expiry date in DD/MM/YYYY format or 'Permanent'"
                                    }
                                },
                                required = new[] { "citizenId", "fullName", "dateOfBirth", "sex", "nationality", "placeOfOrigin", 
                                    "placeOfResidence", "expiryDate" }
                            },
                            validationErrors = new
                            {
                                type = "array",
                                items = new
                                {
                                    type = "string",
                                    @enum = new[] { "BLURRY_IMAGE", "INVALID_IMAGE" }
                                }
                            }
                        },
                        required = new[] { "success", "extractedData", "validationErrors" }
                    }
                }
            };
        }

        private CitizenIdOcrResponse ExtractStructuredResponse(string response)
        {
            try
            {
                using var doc = JsonDocument.Parse(response);
                if (!doc.RootElement.TryGetProperty("candidates", out var candidates) || candidates.ValueKind != JsonValueKind.Array)
                {
                    throw new InvalidInformationException("No candidates in response");
                }

                if (candidates.GetArrayLength() > 0)
                {
                    var content = candidates[0].GetProperty("content");
                    var parts = content.GetProperty("parts");
                    if (parts.GetArrayLength() > 0)
                    {
                        var structuredText = parts[0].GetProperty("text").GetString() ?? "{}";

                        return ParseStructuredCitizenIdResponse(structuredText);
                    }
                }

                throw new InvalidInformationException("Empty response from API");
            }
            catch (JsonException)
            {
                throw new InvalidInformationException("Invalid API response format");
            }
        }

        private static CitizenIdOcrResponse ParseStructuredCitizenIdResponse(string jsonContent)
        {
            using var doc = JsonDocument.Parse(jsonContent);
            var root = doc.RootElement;

            // Check if extraction was successful
            if (root.TryGetProperty("success", out var successElement) && !successElement.GetBoolean())
            {
                // Handle validation errors
                if (root.TryGetProperty("validationErrors", out var errorsElement)
                    && errorsElement.ValueKind == JsonValueKind.Array
                    && errorsElement.GetArrayLength() > 0)
                {
                    var error = errorsElement.EnumerateArray().FirstOrDefault();
                    throw new InvalidMediaException(error.GetString() ?? "Unknown validation error");
                }
                throw new InvalidInformationException("Extraction failed");
            }

            if (!root.TryGetProperty("extractedData", out var extractedData))
            {
                throw new InvalidInformationException("No extracted data found");
            }

            // Validate required fields
            var requiredFields = new[] { "citizenId", "fullName", "dateOfBirth", "sex", "nationality", "placeOfOrigin", 
                "placeOfResidence", "expiryDate" };
            foreach (var field in requiredFields)
            {
                if (!extractedData.TryGetProperty(field, out var prop) ||
                    prop.ValueKind == JsonValueKind.Null ||
                    (prop.ValueKind == JsonValueKind.String && string.IsNullOrWhiteSpace(prop.GetString())))
                {
                    throw new NullValueDataException($"Missing required field: {field}");
                }
            }

            return new CitizenIdOcrResponse
            {
                CitizenId = GetStringValue(extractedData, "citizenId"),
                FullName = GetStringValue(extractedData, "fullName"),
                DateOfBirth = ParseDate(GetStringValue(extractedData, "dateOfBirth")),
                Sex = GetStringValue(extractedData, "sex"),
                Nationality = GetStringValue(extractedData, "nationality"),
                PlaceOfOrigin = GetStringValue(extractedData, "placeOfOrigin"),
                PlaceOfResidence = GetStringValue(extractedData, "placeOfResidence"),
                ExpiryDate = ParseDate(GetStringValue(extractedData, "expiryDate")),
            };
        }

        private static string GetStringValue(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var prop) ?
                prop.GetString() ?? throw new NullValueDataException($"Null value for {propertyName}") :
                throw new NullValueDataException($"Missing property: {propertyName}");
        }

        private static DateOnly? ParseDate(string dateString)
        {
            if (string.IsNullOrWhiteSpace(dateString) || dateString.Equals("Permanent", StringComparison.OrdinalIgnoreCase))
                return null;

            return DateOnly.TryParseExact(dateString, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date) 
                ? date : null;
        }

        private static async Task<(string base64Image, string mimeType)> GetImageAsBase64Async(IFormFile file)
        {
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            var imageBytes = memoryStream.ToArray();
            return (Convert.ToBase64String(imageBytes), file.ContentType);
        }
    }
}