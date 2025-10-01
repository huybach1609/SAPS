using SAPLDesktopApp.Constants;
using SAPLDesktopApp.DTOs.Concrete.ParkingSessionDtos;
using SAPLDesktopApp.DTOs.Concrete.VehicleDtos;
using SAPLDesktopApp.Dtos.PaymentDtos;
using SAPLDesktopApp.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Avalonia.Media.Imaging;
using System.Text.Json;
using SAPLDesktopApp.Dtos;

namespace SAPLDesktopApp.Services
{
    public sealed class ParkingSessionService : IParkingSessionService
    {
        private readonly HttpClient _httpClient;
        private readonly IApiConfigurationService _apiConfiguration;
        private readonly IAuthenticationService _authenticationService;

        public ParkingSessionService(
            IApiConfigurationService apiConfiguration,
            IAuthenticationService authenticationService)
        {
            _apiConfiguration = apiConfiguration ?? throw new ArgumentNullException(nameof(apiConfiguration));
            _authenticationService = authenticationService ?? throw new ArgumentNullException(nameof(authenticationService));
            _httpClient = new HttpClient();
        }

        public async Task CheckInAsync(CheckInParkingSessionRequest request)
        {
            try
            {
                var url = $"{_apiConfiguration.BaseUrl}/api/parkingsession/check-in";

                // Ensure we have a valid token
                await _authenticationService.EnsureValidTokenAsync();
                var authHeader = _authenticationService.GetAuthorizationHeader();
                
                if (string.IsNullOrEmpty(authHeader))
                {
                    throw new InvalidOperationException("No authentication token available");
                }

                // Create multipart form data content
                using var formData = new MultipartFormDataContent();
                
                // Add text fields
                formData.Add(new StringContent(request.VehicleType?? VehicleType.Motorbike.ToString()), "VehicleType");
                formData.Add(new StringContent(request.VehicleLicensePlate), "VehicleLicensePlate");
                formData.Add(new StringContent(request.ParkingLotId), "ParkingLotId");

                // Add image files
                if (request.EntryFrontCapture != null && request.EntryFrontCapture.Length > 0)
                {
                    var frontImageContent = new ByteArrayContent(request.EntryFrontCapture);
                    frontImageContent.Headers.ContentType = System.Net.Http.Headers.MediaTypeHeaderValue.Parse("image/jpeg");
                    formData.Add(frontImageContent, "EntryFrontCapture", "front_entry.jpg");
                }

                if (request.EntryBackCapture != null && request.EntryBackCapture.Length > 0)
                {
                    var backImageContent = new ByteArrayContent(request.EntryBackCapture);
                    backImageContent.Headers.ContentType = System.Net.Http.Headers.MediaTypeHeaderValue.Parse("image/jpeg");
                    formData.Add(backImageContent, "EntryBackCapture", "back_entry.jpg");
                }

                // Set authorization header
                _httpClient.DefaultRequestHeaders.Authorization = 
                    System.Net.Http.Headers.AuthenticationHeaderValue.Parse(authHeader);

                var response = await _httpClient.PostAsync(url, formData);
                response.EnsureSuccessStatusCode();

                System.Diagnostics.Debug.WriteLine($"ParkingSessionService: Vehicle {request.VehicleLicensePlate} checked in successfully");
            }
            catch (HttpRequestException ex)
            {
                System.Diagnostics.Debug.WriteLine($"ParkingSessionService: Check-in HTTP error: {ex.Message}");
                throw new InvalidOperationException($"Check-in failed: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ParkingSessionService: Check-in error: {ex.Message}");
                throw new InvalidOperationException($"Check-in failed: {ex.Message}", ex);
            }
            finally
            {
                // Clear authorization header after request
                _httpClient.DefaultRequestHeaders.Authorization = null;
            }
        }

        public async Task AutomaticallyCheckOutAsync(FinishParkingSessionRequest request)
        {
            await CheckOutInternalAsync(request, "finish");
        }

        public async Task ManuallyCheckOutAsync(FinishParkingSessionRequest request)
        {
            await CheckOutInternalAsync(request, "force-finish");
        }

        private async Task CheckOutInternalAsync(FinishParkingSessionRequest request, string endpoint)
        {
            try
            {
                var url = $"{_apiConfiguration.BaseUrl}/api/parkingsession/{endpoint}";

                // Ensure we have a valid token
                await _authenticationService.EnsureValidTokenAsync();
                var authHeader = _authenticationService.GetAuthorizationHeader();
                
                if (string.IsNullOrEmpty(authHeader))
                {
                    throw new InvalidOperationException("No authentication token available");
                }

                // Create multipart form data content
                using var formData = new MultipartFormDataContent();
                
                // Add text fields
                formData.Add(new StringContent(request.VehicleLicensePlate), "VehicleLicensePlate");
                formData.Add(new StringContent(request.ParkingLotId), "ParkingLotId");

                // Add image files
                if (request.ExitFrontCapture != null && request.ExitFrontCapture.Length > 0)
                {
                    var frontImageContent = new ByteArrayContent(request.ExitFrontCapture);
                    frontImageContent.Headers.ContentType = System.Net.Http.Headers.MediaTypeHeaderValue.Parse("image/jpeg");
                    formData.Add(frontImageContent, "ExitFrontCapture", "front_exit.jpg");
                }

                if (request.ExitBackCapture != null && request.ExitBackCapture.Length > 0)
                {
                    var backImageContent = new ByteArrayContent(request.ExitBackCapture);
                    backImageContent.Headers.ContentType = System.Net.Http.Headers.MediaTypeHeaderValue.Parse("image/jpeg");
                    formData.Add(backImageContent, "ExitBackCapture", "back_exit.jpg");
                }

                // Set authorization header
                _httpClient.DefaultRequestHeaders.Authorization = 
                    System.Net.Http.Headers.AuthenticationHeaderValue.Parse(authHeader);

                var response = await _httpClient.PostAsync(url, formData);
                response.EnsureSuccessStatusCode();

                System.Diagnostics.Debug.WriteLine($"ParkingSessionService: Vehicle {request.VehicleLicensePlate} checked out successfully");
            }
            catch (HttpRequestException ex)
            {
                System.Diagnostics.Debug.WriteLine($"ParkingSessionService: Check-out HTTP error: {ex.Message}");
                throw new InvalidOperationException($"Check-out failed: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ParkingSessionService: Check-out error: {ex.Message}");
                throw new InvalidOperationException($"Check-out failed: {ex.Message}", ex);
            }
            finally
            {
                // Clear authorization header after request
                _httpClient.DefaultRequestHeaders.Authorization = null;
            }
        }

        public async Task<List<ParkingSessionItem>> GetParkingSessionList(string parkingLotId)
        {
            try
            {
                // If parkingLotId is empty, get from current user
                if (string.IsNullOrEmpty(parkingLotId))
                {
                    var currentUser = AuthenticationState.CurrentUser;
                    parkingLotId = currentUser?.ParkingLotId ?? "";
                }

                var url = $"{_apiConfiguration.BaseUrl}/api/parkingsession/by-lot?parkingLotId={parkingLotId}";

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
                var returnData = JsonSerializer.Deserialize<ReturnDto<List<ParkingSessionSummaryForParkingLotDto>>>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                System.Diagnostics.Debug.WriteLine($"ParkingSessionService: Retrieved {returnData?.Data?.Count ?? 0} parking sessions");
                
                // Convert the list of ParkingSessionSummaryForParkingLotDto to ParkingSessionItem
                if (returnData?.Data != null)
                {
                    var result = returnData.Data.Select(dto => new ParkingSessionItem
                    {
                        Id = dto.Id,
                        LicensePlate = dto.LicensePlate,
                        EntryDateTime = dto.EntryDateTime,
                        ExitDateTime = dto.ExitDateTime,
                        Cost = dto.Cost,
                        Status = dto.Status,
                        PaymentStatus = dto.PaymentStatus,
                    }).OrderByDescending(ps => ps.EntryDateTime).ToList();
                    
                    return result;
                }
                
                return new List<ParkingSessionItem>();
            }
            catch (HttpRequestException ex)
            {
                System.Diagnostics.Debug.WriteLine($"ParkingSessionService: Get session list HTTP error: {ex.Message}");
                throw new InvalidOperationException($"Failed to retrieve parking sessions");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ParkingSessionService: Get session list error: {ex.Message}");
                throw new InvalidOperationException($"Failed to retrieve parking sessions");
            }
            finally
            {
                // Clear authorization header after request
                _httpClient.DefaultRequestHeaders.Authorization = null;
            }
        }

        public async Task<ParkingSessionDetailsForParkingLotDto?> GetActiveSessionDetailsAsync(string parkingLotId, string licensePlate)
        {
            try
            {
                var url = $"{_apiConfiguration.BaseUrl}/api/parkingsession/license-plate/{parkingLotId}/{Uri.EscapeDataString(licensePlate)}";

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
                    // No active session found
                    return null;
                }

                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var returnData = JsonSerializer.Deserialize<ReturnDto<ParkingSessionDetailsForParkingLotDto>>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                System.Diagnostics.Debug.WriteLine($"ParkingSessionService: Retrieved active session for {licensePlate}");
                
                return returnData?.Data;
            }
            catch (HttpRequestException ex)
            {
                System.Diagnostics.Debug.WriteLine($"ParkingSessionService: Get active session HTTP error: {ex.Message}");
                return null; // Return null instead of throwing for this method
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ParkingSessionService: Get active session error: {ex.Message}");
                return null; // Return null instead of throwing for this method
            }
            finally
            {
                // Clear authorization header after request
                _httpClient.DefaultRequestHeaders.Authorization = null;
            }
        }

        public async Task<ParkingSessionDetailsForParkingLotDto?> GetParkingSessionDetailsAsync(string sessionId)
        {
            try
            {
                var url = $"{_apiConfiguration.BaseUrl}/api/parkingsession/lot/{sessionId}";

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
                    // Session not found
                    return null;
                }

                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var returnData = JsonSerializer.Deserialize<ReturnDto<ParkingSessionDetailsForParkingLotDto>>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                System.Diagnostics.Debug.WriteLine($"ParkingSessionService: Retrieved parking session details for {sessionId}");
                
                return returnData?.Data;
            }
            catch (HttpRequestException ex)
            {
                System.Diagnostics.Debug.WriteLine($"ParkingSessionService: Get session details HTTP error: {ex.Message}");
                throw new InvalidOperationException($"Failed to retrieve session details");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ParkingSessionService: Get session details error: {ex.Message}");
                throw new InvalidOperationException($"Failed to retrieve session details");
            }
            finally
            {
                // Clear authorization header after request
                _httpClient.DefaultRequestHeaders.Authorization = null;
            }
        }

        /// <summary>
        /// Gets payment information for a parking session
        /// </summary>
        /// <param name="sessionId">The ID of the parking session</param>
        /// <returns>Payment information for the session or null if not found</returns>
        public async Task<PaymentApiResponseDto?> GetSessionPaymentInfoAsync(string sessionId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(sessionId))
                {
                    throw new ArgumentException("Session ID cannot be null or empty", nameof(sessionId));
                }

                var url = $"{_apiConfiguration.BaseUrl}/api/parkingSession/{Uri.EscapeDataString(sessionId)}/payment-info-staff";

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
                    // Payment information not found
                    System.Diagnostics.Debug.WriteLine($"ParkingSessionService: Payment info not found for session {sessionId}");
                    return null;
                }

                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var paymentInfo = JsonSerializer.Deserialize<PaymentApiResponseDto>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                System.Diagnostics.Debug.WriteLine($"ParkingSessionService: Retrieved payment information for session {sessionId}");
                
                return paymentInfo;
            }
            catch (HttpRequestException ex)
            {
                System.Diagnostics.Debug.WriteLine($"ParkingSessionService: Get payment info HTTP error: {ex.Message}");
                throw new InvalidOperationException($"Failed to retrieve payment information: {ex.Message}", ex);
            }
            catch (JsonException ex)
            {
                System.Diagnostics.Debug.WriteLine($"ParkingSessionService: Get payment info JSON error: {ex.Message}");
                throw new InvalidOperationException($"Failed to parse payment information response: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ParkingSessionService: Get payment info error: {ex.Message}");
                throw new InvalidOperationException($"Failed to retrieve payment information: {ex.Message}", ex);
            }
            finally
            {
                // Clear authorization header after request
                _httpClient.DefaultRequestHeaders.Authorization = null;
            }
        }

        /// <summary>
        /// Helper method to convert Bitmap to byte array
        /// </summary>
        public static byte[] BitmapToByteArray(Bitmap? bitmap)
        {
            if (bitmap == null) 
                return Array.Empty<byte>();

            try
            {
                using var stream = new MemoryStream();
                bitmap.Save(stream);
                return stream.ToArray();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ParkingSessionService: Error converting bitmap to byte array: {ex.Message}");
                return Array.Empty<byte>();
            }
        }

        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }
}