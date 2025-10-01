using SAPLDesktopApp.DTOs.Concrete.IncidenceReportDtos;
using SAPLSServer.DTOs.PaginationDto;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    public class IncidenceReportService : IIncidenceReportService, IDisposable
    {
        private readonly HttpClient _httpClient;
        private readonly IApiConfigurationService _apiConfiguration;
        private readonly IAuthenticationService _authenticationService;

        public IncidenceReportService(
            IApiConfigurationService apiConfiguration,
            IAuthenticationService authenticationService)
        {
            _apiConfiguration = apiConfiguration ?? throw new ArgumentNullException(nameof(apiConfiguration));
            _authenticationService = authenticationService ?? throw new ArgumentNullException(nameof(authenticationService));
            _httpClient = new HttpClient();
        }

        public async Task<IncidentReportDetailsDto> CreateIncidentReportAsync(CreateIncidentReportRequest request)
        {
            try
            {
                var url = $"{_apiConfiguration.BaseUrl}/api/incidentreport";

                // Ensure we have a valid token
                await _authenticationService.EnsureValidTokenAsync();
                var authHeader = _authenticationService.GetAuthorizationHeader();
                
                if (string.IsNullOrEmpty(authHeader))
                {
                    throw new InvalidOperationException("No authentication token available");
                }

                // Create multipart form data for file uploads
                using var formData = new MultipartFormDataContent();
                
                // Add text fields
                formData.Add(new StringContent(request.Header), "Header");
                formData.Add(new StringContent(request.Priority), "Priority");
                formData.Add(new StringContent(request.Description), "Description");

                // Add evidence files if any
                if (request.UploadedEvidences != null && request.UploadedEvidences.Length > 0)
                {
                    foreach (var evidence in request.UploadedEvidences)
                    {
                        // Use the temp file path for uploading
                        var filePath = !string.IsNullOrEmpty(evidence.TempFilePath) ? evidence.TempFilePath : evidence.LocalUrl;
                        
                        if (!string.IsNullOrEmpty(filePath) && File.Exists(filePath))
                        {
                            var fileStream = File.OpenRead(filePath);
                            var streamContent = new StreamContent(fileStream);
                            
                            // Set content type based on the evidence's content type
                            streamContent.Headers.ContentType = System.Net.Http.Headers.MediaTypeHeaderValue.Parse(evidence.ContentType);
                            
                            formData.Add(streamContent, "Evidences", evidence.OriginalFileName);
                        }
                    }
                }

                // Set authorization header
                _httpClient.DefaultRequestHeaders.Authorization = 
                    System.Net.Http.Headers.AuthenticationHeaderValue.Parse(authHeader);

                var response = await _httpClient.PostAsync(url, formData);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<IncidentReportDetailsDto>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                System.Diagnostics.Debug.WriteLine($"IncidenceReportService: Incident report created successfully - {request.Header}");
                
                return result ?? new IncidentReportDetailsDto();
            }
            catch (HttpRequestException ex)
            {
                System.Diagnostics.Debug.WriteLine($"IncidenceReportService: Create incident HTTP error: {ex.Message}");
                throw new InvalidOperationException($"Failed to create incident report: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"IncidenceReportService: Create incident error: {ex.Message}");
                throw new InvalidOperationException($"Failed to create incident report: {ex.Message}", ex);
            }
            finally
            {
                // Clear authorization header after request
                _httpClient.DefaultRequestHeaders.Authorization = null;
            }
        }

        public async Task<List<IncidentReportSummaryDto>> GetIncidentReportListAsync(GetIncidenReportListRequest request)
        {
            try
            {
                // If ParkingLotId is not provided, get it from current user
                if (string.IsNullOrEmpty(request.ParkingLotId))
                {
                    var currentUser = AuthenticationState.CurrentUser;
                    request.ParkingLotId = currentUser?.ParkingLotId ?? "";
                }

                // Build query parameters
                var queryParams = $"?parkingLotId={Uri.EscapeDataString(request.ParkingLotId)}";
                
                if (!string.IsNullOrEmpty(request.Priority))
                {
                    queryParams += $"&priority={Uri.EscapeDataString(request.Priority)}";
                }
                
                if (!string.IsNullOrEmpty(request.Status))
                {
                    queryParams += $"&status={Uri.EscapeDataString(request.Status)}";
                }
                
                if (request.StartDate.HasValue)
                {
                    queryParams += $"&startDate={request.StartDate.Value:yyyy-MM-dd}";
                }
                
                if (request.EndDate.HasValue)
                {
                    queryParams += $"&endDate={request.EndDate.Value:yyyy-MM-dd}";
                }

                var url = $"{_apiConfiguration.BaseUrl}/api/incidentreport{queryParams}";

                // Ensure we have a valid token
                await _authenticationService.EnsureValidTokenAsync();
                var authHeader = _authenticationService.GetAuthorizationHeader();
                
                if (string.IsNullOrEmpty(authHeader))
                {
                    throw new InvalidOperationException("No authentication token available");
                }

                // Set authorization header
                _httpClient.DefaultRequestHeaders.Authorization = 
                    System.Net.Http.Headers.AuthenticationHeaderValue.Parse(authHeader);

                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<List<IncidentReportSummaryDto>>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                System.Diagnostics.Debug.WriteLine($"IncidenceReportService: Retrieved {result?.Count ?? 0} incident reports");
                
                return result?.OrderByDescending(ir => ir.ReportedDate).ToList() ?? new List<IncidentReportSummaryDto>();
            }
            catch (HttpRequestException ex)
            {
                System.Diagnostics.Debug.WriteLine($"IncidenceReportService: Get incident list HTTP error: {ex.Message}");
                throw new InvalidOperationException($"Failed to retrieve incident reports: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"IncidenceReportService: Get incident list error: {ex.Message}");
                throw new InvalidOperationException($"Failed to retrieve incident reports: {ex.Message}", ex);
            }
            finally
            {
                // Clear authorization header after request
                _httpClient.DefaultRequestHeaders.Authorization = null;
            }
        }

        public async Task<IncidentReportDetailsDto> GetIncidentReportDetailsAsync(string incidentReportId)
        {
            try
            {
                if (string.IsNullOrEmpty(incidentReportId))
                {
                    throw new ArgumentException("Incident report ID cannot be null or empty", nameof(incidentReportId));
                }

                var url = $"{_apiConfiguration.BaseUrl}/api/incidentreport/{Uri.EscapeDataString(incidentReportId)}";

                // Ensure we have a valid token
                await _authenticationService.EnsureValidTokenAsync();
                var authHeader = _authenticationService.GetAuthorizationHeader();
                
                if (string.IsNullOrEmpty(authHeader))
                {
                    throw new InvalidOperationException("No authentication token available");
                }

                // Set authorization header
                _httpClient.DefaultRequestHeaders.Authorization = 
                    System.Net.Http.Headers.AuthenticationHeaderValue.Parse(authHeader);

                var response = await _httpClient.GetAsync(url);
                
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    throw new InvalidOperationException($"Incident report with ID {incidentReportId} not found");
                }

                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<IncidentReportDetailsDto>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (result == null)
                {
                    throw new InvalidOperationException("Failed to deserialize incident report details");
                }

                System.Diagnostics.Debug.WriteLine($"IncidenceReportService: Retrieved incident report details for ID {incidentReportId}");
                
                return result;
            }
            catch (HttpRequestException ex)
            {
                System.Diagnostics.Debug.WriteLine($"IncidenceReportService: Get incident details HTTP error: {ex.Message}");
                throw new InvalidOperationException($"Failed to retrieve incident report details: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"IncidenceReportService: Get incident details error: {ex.Message}");
                throw new InvalidOperationException($"Failed to retrieve incident report details: {ex.Message}", ex);
            }
            finally
            {
                // Clear authorization header after request
                _httpClient.DefaultRequestHeaders.Authorization = null;
            }
        }

        // Keep the old paginated method for backward compatibility
        public async Task<PageResult<IncidentReportSummaryDto>> GetIncidentReportPageAsync(PageRequest pageRequest, 
            GetIncidenReportListRequest request)
        {
            var allItems = await GetIncidentReportListAsync(request);
            
            var skip = (pageRequest.PageNumber - 1) * pageRequest.PageSize;
            var take = pageRequest.PageSize;
            
            var pagedItems = allItems.Skip(skip).Take(take).ToList();
            
            return new PageResult<IncidentReportSummaryDto>
            {
                Items = pagedItems,
                TotalCount = allItems.Count,
                PageNumber = pageRequest.PageNumber,
                PageSize = pageRequest.PageSize
            };
        }

        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }
}