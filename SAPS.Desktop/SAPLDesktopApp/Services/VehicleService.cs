using SAPLDesktopApp.Constants;
using SAPLDesktopApp.DTOs.Concrete.VehicleDtos;
using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    public class VehicleService : IVehicleService, IDisposable
    {
        private readonly HttpClient _httpClient;
        private readonly IApiConfigurationService _apiConfiguration;
        private readonly IAuthenticationService _authenticationService;

        public VehicleService(
            IApiConfigurationService apiConfiguration,
            IAuthenticationService authenticationService)
        {
            _apiConfiguration = apiConfiguration ?? throw new ArgumentNullException(nameof(apiConfiguration));
            _authenticationService = authenticationService ?? throw new ArgumentNullException(nameof(authenticationService));
            _httpClient = new HttpClient();
        }

        public async Task<VehicleDetailsDto?> GetVehicleByLicensePlateAsync(string licensePlate)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(licensePlate))
                {
                    throw new ArgumentException("License plate cannot be empty", nameof(licensePlate));
                }

                var url = $"{_apiConfiguration.BaseUrl}/api/vehicle/license-plate/{Uri.EscapeDataString(licensePlate)}";

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
                    // Vehicle not found
                    System.Diagnostics.Debug.WriteLine($"VehicleService: Vehicle with license plate '{licensePlate}' not found");
                    return null;
                }

                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var vehicleDetails = JsonSerializer.Deserialize<VehicleDetailsDto>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                System.Diagnostics.Debug.WriteLine($"VehicleService: Retrieved vehicle details for {licensePlate}");
                
                return vehicleDetails;
            }
            catch (HttpRequestException ex)
            {
                System.Diagnostics.Debug.WriteLine($"VehicleService: Get vehicle HTTP error: {ex.Message}");
                throw new InvalidOperationException($"Vehicle details not found");
            }
            catch (JsonException ex)
            {
                System.Diagnostics.Debug.WriteLine($"VehicleService: JSON deserialization error: {ex.Message}");
                throw new InvalidOperationException($"Invalid response format");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"VehicleService: Get vehicle error: {ex.Message}");
                throw new InvalidOperationException($"Failed to retrieve vehicle details");
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