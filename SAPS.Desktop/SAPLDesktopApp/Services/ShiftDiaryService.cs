using SAPLDesktopApp.DTOs.Concrete.ShiftDiaryDtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    public class ShiftDiaryService : IShiftDiaryService, IDisposable
    {
        private readonly HttpClient _httpClient;
        private readonly IApiConfigurationService _apiConfiguration;
        private readonly IAuthenticationService _authenticationService;

        public ShiftDiaryService(
            IApiConfigurationService apiConfiguration,
            IAuthenticationService authenticationService)
        {
            _apiConfiguration = apiConfiguration ?? throw new ArgumentNullException(nameof(apiConfiguration));
            _authenticationService = authenticationService ?? throw new ArgumentNullException(nameof(authenticationService));
            _httpClient = new HttpClient();
        }

        public async Task CreateShiftDiaryAsync(CreateShiftDiaryRequest request)
        {
            try
            {
                var url = $"{_apiConfiguration.BaseUrl}/api/shiftdiary";

                // Ensure we have a valid token
                await _authenticationService.EnsureValidTokenAsync();
                var authHeader = _authenticationService.GetAuthorizationHeader();
                
                if (string.IsNullOrEmpty(authHeader))
                {
                    throw new InvalidOperationException("No authentication token available");
                }

                // If ParkingLotId is not provided, get it from current user
                if (string.IsNullOrEmpty(request.ParkingLotId))
                {
                    var currentUser = AuthenticationState.CurrentUser;
                    request.ParkingLotId = currentUser?.ParkingLotId ?? "";
                }

                // Serialize the request to JSON
                var jsonContent = JsonSerializer.Serialize(request, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                // Set authorization header
                _httpClient.DefaultRequestHeaders.Authorization = 
                    System.Net.Http.Headers.AuthenticationHeaderValue.Parse(authHeader);

                var response = await _httpClient.PostAsync(url, content);
                response.EnsureSuccessStatusCode();

                System.Diagnostics.Debug.WriteLine($"ShiftDiaryService: Shift diary created successfully - {request.Header}");
            }
            catch (HttpRequestException ex)
            {
                System.Diagnostics.Debug.WriteLine($"ShiftDiaryService: Create shift diary HTTP error: {ex.Message}");
                throw new InvalidOperationException($"Failed to create shift diary: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ShiftDiaryService: Create shift diary error: {ex.Message}");
                throw new InvalidOperationException($"Failed to create shift diary: {ex.Message}", ex);
            }
            finally
            {
                // Clear authorization header after request
                _httpClient.DefaultRequestHeaders.Authorization = null;
            }
        }

        public async Task<List<ShiftDiarySummaryDto>> GetShiftDiaryListAsync(GetShiftDiaryListRequest request)
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
                
                if (request.UploadedDate.HasValue)
                {
                    queryParams += $"&uploadedDate={request.UploadedDate.Value:yyyy-MM-dd}";
                }

                var url = $"{_apiConfiguration.BaseUrl}/api/shiftdiary/list{queryParams}";

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

                var jsonContent = await response.Content.ReadAsStringAsync();
                var shiftDiaryList = JsonSerializer.Deserialize<List<ShiftDiarySummaryDto>>(jsonContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                System.Diagnostics.Debug.WriteLine($"ShiftDiaryService: Retrieved {shiftDiaryList?.Count ?? 0} shift diaries");
                
                return shiftDiaryList?.OrderByDescending(s => s.CreatedAt).ToList() ?? new List<ShiftDiarySummaryDto>();
            }
            catch (HttpRequestException ex)
            {
                System.Diagnostics.Debug.WriteLine($"ShiftDiaryService: Get shift diary list HTTP error: {ex.Message}");
                throw new InvalidOperationException($"Failed to retrieve shift diaries: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ShiftDiaryService: Get shift diary list error: {ex.Message}");
                throw new InvalidOperationException($"Failed to retrieve shift diaries: {ex.Message}", ex);
            }
            finally
            {
                // Clear authorization header after request
                _httpClient.DefaultRequestHeaders.Authorization = null;
            }
        }

        public async Task<ShiftDiaryDetailsDto> GetShiftDiaryDetailsAsync(string shiftDiaryId)
        {
            try
            {
                if (string.IsNullOrEmpty(shiftDiaryId))
                {
                    throw new ArgumentException("Shift diary ID cannot be null or empty", nameof(shiftDiaryId));
                }

                var url = $"{_apiConfiguration.BaseUrl}/api/shiftdiary/{Uri.EscapeDataString(shiftDiaryId)}";

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
                    throw new InvalidOperationException($"Shift diary with ID {shiftDiaryId} not found");
                }

                response.EnsureSuccessStatusCode();

                var jsonContent = await response.Content.ReadAsStringAsync();
                var shiftDiaryDetails = JsonSerializer.Deserialize<ShiftDiaryDetailsDto>(jsonContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (shiftDiaryDetails == null)
                {
                    throw new InvalidOperationException("Failed to deserialize shift diary details");
                }

                System.Diagnostics.Debug.WriteLine($"ShiftDiaryService: Retrieved shift diary details for ID {shiftDiaryId}");
                
                return shiftDiaryDetails;
            }
            catch (HttpRequestException ex)
            {
                System.Diagnostics.Debug.WriteLine($"ShiftDiaryService: Get shift diary details HTTP error: {ex.Message}");
                throw new InvalidOperationException($"Failed to retrieve shift diary details: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ShiftDiaryService: Get shift diary details error: {ex.Message}");
                throw new InvalidOperationException($"Failed to retrieve shift diary details: {ex.Message}", ex);
            }
            finally
            {
                // Clear authorization header after request
                _httpClient.DefaultRequestHeaders.Authorization = null;
            }
        }

        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }
}