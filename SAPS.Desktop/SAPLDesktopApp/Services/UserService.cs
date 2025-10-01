using SAPLDesktopApp.DTOs.Concrete.UserDtos;
using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    public class UserService : IUserService
    {
        private readonly HttpClient _httpClient;
        private readonly IApiConfigurationService _apiConfiguration;
        private readonly IAuthenticationService _authService;

        public UserService(
            IApiConfigurationService apiConfiguration,
            IAuthenticationService authService)
        {
            _httpClient = new HttpClient();
            _apiConfiguration = apiConfiguration ?? throw new ArgumentNullException(nameof(apiConfiguration));
            _authService = authService ?? throw new ArgumentNullException(nameof(authService));
        }

        /// <summary>
        /// Updates the current user's password
        /// </summary>
        /// <param name="request">Request containing old and new password</param>
        /// <returns>True if password was updated successfully</returns>
        public async Task<bool> UpdatePasswordAsync(UpdateUserPasswordRequest request)
        {
            try
            {
                // Ensure we have a valid token before making the request
                await _authService.EnsureValidTokenAsync();

                var url = $"{_apiConfiguration.BaseUrl}/api/password";
                var authHeader = _authService.GetAuthorizationHeader();

                if (string.IsNullOrEmpty(authHeader))
                    throw new UnauthorizedAccessException("User is not authenticated");

                // Set the authorization header
                _httpClient.DefaultRequestHeaders.Authorization =
                    System.Net.Http.Headers.AuthenticationHeaderValue.Parse(authHeader);

                // Send the PUT request
                var response = await _httpClient.PutAsJsonAsync(url, request);

                if (response.IsSuccessStatusCode)
                {
                    System.Diagnostics.Debug.WriteLine("Password updated successfully");
                    return true;
                }

                if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                    throw new UnauthorizedAccessException("Invalid credentials or session expired");

                if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    throw new InvalidOperationException($"Invalid password or current password is incorrect. {error}");
                }

                var msg = await response.Content.ReadAsStringAsync();
                throw new InvalidOperationException($"Failed to update password: {msg}");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error updating password: {ex.Message}");
                throw;
            }
            finally
            {
                // Clear the authorization header after the request
                _httpClient.DefaultRequestHeaders.Authorization = null;
            }
        }

        /// <summary>
        /// Requests a password reset for the specified email address
        /// </summary>
        /// <param name="email">The email address to request password reset for</param>
        /// <returns>True if the reset request was sent successfully</returns>
        public async Task<bool> RequestResetPasswordAsync(string email)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email))
                    throw new ArgumentException("Email address is required", nameof(email));

                var url = $"{_apiConfiguration.BaseUrl}/api/password/request/reset/{Uri.EscapeDataString(email)}";
                
                System.Diagnostics.Debug.WriteLine($"UserService: Requesting password reset for {email} at {url}");

                // Send the GET request (no authentication required for password reset request)
                var response = await _httpClient.GetAsync(url);

                if (response.IsSuccessStatusCode)
                {
                    System.Diagnostics.Debug.WriteLine($"Password reset request sent successfully for {email}");
                    return true;
                }

                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    throw new InvalidOperationException("Email address not found in the system");
                }

                if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    throw new InvalidOperationException($"Invalid email address format or request: {error}");
                }

                var msg = await response.Content.ReadAsStringAsync();
                throw new InvalidOperationException($"Failed to request password reset: {msg}");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error requesting password reset for {email}: {ex.Message}");
                throw;
            }
        }

        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }
}