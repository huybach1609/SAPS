using SAPLDesktopApp.DTOs.Concrete.UserDtos;
using SAPLDesktopApp.Models;
using Microsoft.IdentityModel.JsonWebTokens;
using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using System.Threading;

namespace SAPLDesktopApp.Services
{
    public class AuthenticationService : IAuthenticationService
    {
        private readonly HttpClient _httpClient;
        private readonly IApiConfigurationService _apiConfiguration;
        private readonly string _instanceId;
        private readonly SemaphoreSlim _refreshSemaphore = new(1, 1);
        private bool _isRefreshing = false;

        public bool IsAuthenticated => AuthenticationState.IsAuthenticated;
        public LoggedInUser? CurrentUser => AuthenticationState.CurrentUser;
        public AuthenticationToken? CurrentToken => AuthenticationState.CurrentToken;
        public string? AccessToken => AuthenticationState.AccessToken;

        public AuthenticationService(IApiConfigurationService apiConfiguration)
        {
            _instanceId = Guid.NewGuid().ToString()[..8];
            _apiConfiguration = apiConfiguration ?? throw new ArgumentNullException(nameof(apiConfiguration));
            _httpClient = new HttpClient();

            System.Diagnostics.Debug.WriteLine($"AuthenticationService created - Instance ID: {_instanceId}");
        }

        public string? GetAuthorizationHeader()
        {
            var header = AuthenticationState.GetAuthorizationHeader();
            System.Diagnostics.Debug.WriteLine($"GetAuthorizationHeader - Instance: {_instanceId}, Header: {(header != null ? "EXISTS" : "NULL")}");
            return header;
        }

        /// <summary>
        /// Get authorization header with automatic token refresh if needed
        /// </summary>
        public async Task<string?> GetAuthorizationHeaderAsync()
        {
            await EnsureValidTokenAsync();
            return GetAuthorizationHeader();
        }

        /// <summary>
        /// Ensure the current token is valid, refresh if necessary
        /// </summary>
        public async Task EnsureValidTokenAsync()
        {
            if (AuthenticationState.CurrentToken == null || AuthenticationState.CurrentUser == null)
            {
                System.Diagnostics.Debug.WriteLine($"EnsureValidTokenAsync - No token or user available");
                return;
            }

            // Check if token needs refresh (expires within 5 minutes)
            if (WillTokenExpireSoon(TimeSpan.FromMinutes(5)))
            {
                System.Diagnostics.Debug.WriteLine($"EnsureValidTokenAsync - Token needs refresh (expires at {AuthenticationState.CurrentToken.ExpiresAt})");
                await RefreshTokenAsync();
            }
            else
            {
                System.Diagnostics.Debug.WriteLine($"EnsureValidTokenAsync - Token is still valid (expires at {AuthenticationState.CurrentToken.ExpiresAt})");
            }
        }

        /// <summary>
        /// Refresh token with simple concurrency control
        /// </summary>
        private async Task RefreshTokenAsync()
        {
            // Wait for semaphore to ensure only one refresh happens at a time
            await _refreshSemaphore.WaitAsync();
            try
            {
                // Double-check if refresh is still needed
                if (!WillTokenExpireSoon(TimeSpan.FromMinutes(5)))
                {
                    System.Diagnostics.Debug.WriteLine("RefreshTokenAsync - Token no longer needs refresh");
                    return;
                }

                if (_isRefreshing)
                {
                    System.Diagnostics.Debug.WriteLine("RefreshTokenAsync - Refresh already in progress");
                    return;
                }

                var currentToken = AuthenticationState.CurrentToken;
                if (currentToken?.RefreshToken == null)
                {
                    System.Diagnostics.Debug.WriteLine("RefreshTokenAsync - No refresh token available");
                    await ClearAuthenticationAsync();
                    throw new InvalidOperationException("No refresh token available. Please login again.");
                }

                _isRefreshing = true;
                
                try
                {
                    var refreshRequest = new RefreshTokenRequest
                    {
                        RefreshToken = currentToken.RefreshToken
                    };

                    System.Diagnostics.Debug.WriteLine($"RefreshTokenAsync - Starting token refresh for instance {_instanceId}");
                    await RefreshAccessTokenAsync(refreshRequest);
                    
                    System.Diagnostics.Debug.WriteLine($"AuthenticationService: Token refreshed successfully for instance {_instanceId}");
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"AuthenticationService: Token refresh failed for instance {_instanceId}: {ex.Message}");
                    await ClearAuthenticationAsync();
                    throw new InvalidOperationException("Token refresh failed. Please login again.", ex);
                }
            }
            finally
            {
                _isRefreshing = false;
                _refreshSemaphore.Release();
            }
        }

        public async Task LoginAsync(AuthenticateUserRequest request)
        {
            try
            {
                var url = $"{_apiConfiguration.BaseUrl}/api/auth/login";
                System.Diagnostics.Debug.WriteLine($"LoginAsync - Instance: {_instanceId}, URL: {url}");

                var response = await _httpClient.PostAsJsonAsync(url, request);
                response.EnsureSuccessStatusCode();

                var authResponse = await response.Content.ReadFromJsonAsync<AuthenticateUserResponse>();

                if (authResponse != null)
                {
                    // Create token object
                    var token = new AuthenticationToken
                    {
                        AccessToken = authResponse.AccessToken,
                        RefreshToken = authResponse.RefreshToken,
                        TokenType = authResponse.TokenType,
                        ExpiresAt = authResponse.ExpiresAt
                    };

                    // Extract user information from JWT token
                    var user = ExtractUserFromToken(authResponse.AccessToken);

                    // Set authentication state
                    AuthenticationState.SetAuthenticationState(user, token);

                    System.Diagnostics.Debug.WriteLine(
                        $"AuthenticationService: Login successful for user {user.Email} - Instance: {_instanceId}");
                    System.Diagnostics.Debug.WriteLine(
                        $"AuthenticationService: Token expires at {token.ExpiresAt} - Instance: {_instanceId}");
                }
            }
            catch (HttpRequestException ex)
            {
                System.Diagnostics.Debug.WriteLine(
                    $"AuthenticationService: Login HTTP error - Instance: {_instanceId}: {ex.Message}");
                throw new InvalidOperationException($"Invalid login credentials");
            }
            catch (JsonException ex)
            {
                System.Diagnostics.Debug.WriteLine(
                    $"AuthenticationService: Login JSON error - Instance: {_instanceId}: {ex.Message}");
                throw new InvalidOperationException($"Invalid server response");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(
                    $"AuthenticationService: exception error - Instance: {_instanceId}: {ex.Message}");
            }
        }

        public async Task LogoutAsync()
        {
            try
            {
                if (AuthenticationState.CurrentToken != null && !string.IsNullOrEmpty(AuthenticationState.CurrentToken.AccessToken))
                {
                    // Optional: Call logout endpoint on server
                    // var logoutUrl = $"{_apiConfiguration.BaseUrl}/api/auth/logout";
                    // await _httpClient.PostAsync(logoutUrl, null);
                }
            }
            catch (Exception ex)
            {
                // Log the error but don't throw - we still want to clear local state
                System.Diagnostics.Debug.WriteLine($"AuthenticationService: Logout API call failed: {ex.Message}");
            }
            finally
            {
                await ClearAuthenticationAsync();
            }
        }

        public async Task RefreshAccessTokenAsync(RefreshTokenRequest request)
        {
            try
            {
                var url = $"{_apiConfiguration.BaseUrl}/api/auth/refresh-token";

                System.Diagnostics.Debug.WriteLine($"RefreshAccessTokenAsync - Attempting token refresh at {url}");

                // Create a fresh HTTP request
                using var refreshRequest = new HttpRequestMessage(HttpMethod.Post, url);

                // Set the authorization header for this specific request
                var currentAuthHeader = AuthenticationState.GetAuthorizationHeader();
                if (!string.IsNullOrEmpty(currentAuthHeader))
                {
                    refreshRequest.Headers.Authorization =
                        System.Net.Http.Headers.AuthenticationHeaderValue.Parse(currentAuthHeader);
                }

                // Set the JSON content
                refreshRequest.Content = JsonContent.Create(request);

                var response = await _httpClient.SendAsync(refreshRequest);
                response.EnsureSuccessStatusCode();

                var authResponse = await response.Content.ReadFromJsonAsync<AuthenticateUserResponse>();

                if (authResponse != null)
                {
                    // Update token information
                    var token = new AuthenticationToken
                    {
                        AccessToken = authResponse.AccessToken,
                        RefreshToken = authResponse.RefreshToken,
                        TokenType = authResponse.TokenType,
                        ExpiresAt = authResponse.ExpiresAt
                    };

                    // Update user information from new JWT token (in case roles/info changed)
                    var user = ExtractUserFromToken(authResponse.AccessToken);

                    // Update authentication state
                    AuthenticationState.SetAuthenticationState(user, token);

                    System.Diagnostics.Debug.WriteLine($"AuthenticationService: Token refresh successful, new expiry: {token.ExpiresAt}");
                }
                else
                {
                    throw new InvalidOperationException("Empty response from refresh token endpoint");
                }
            }
            catch (HttpRequestException ex)
            {
                System.Diagnostics.Debug.WriteLine($"AuthenticationService: Token refresh HTTP error: {ex.Message}");
                await ClearAuthenticationAsync();
                throw new InvalidOperationException($"Token refresh failed: {ex.Message}");
            }
            catch (JsonException ex)
            {
                System.Diagnostics.Debug.WriteLine($"AuthenticationService: Token refresh JSON error: {ex.Message}");
                await ClearAuthenticationAsync();
                throw new InvalidOperationException($"Invalid refresh response format: {ex.Message}");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"AuthenticationService: Token refresh unexpected error: {ex.Message}");
                await ClearAuthenticationAsync();
                throw new InvalidOperationException($"Token refresh failed: {ex.Message}");
            }
        }

        /// <summary>
        /// Check if refresh token is available and valid
        /// </summary>
        public bool CanRefreshToken()
        {
            return AuthenticationState.CanRefreshToken();
        }

        /// <summary>
        /// Get time until token expires
        /// </summary>
        public TimeSpan? TimeUntilTokenExpiry()
        {
            return AuthenticationState.TimeUntilTokenExpiry();
        }

        /// <summary>
        /// Check if token will expire soon (within specified timespan)
        /// </summary>
        public bool WillTokenExpireSoon(TimeSpan within)
        {
            return AuthenticationState.WillTokenExpireSoon(within);
        }

        /// <summary>
        /// Clear authentication state
        /// </summary>
        private async Task ClearAuthenticationAsync()
        {
            // Clear authentication state
            AuthenticationState.ClearAuthenticationState();

            // Remove authorization header
            _httpClient.DefaultRequestHeaders.Authorization = null;

            System.Diagnostics.Debug.WriteLine($"AuthenticationService: Authentication state cleared - Instance: {_instanceId}");

            // Allow for any cleanup operations
            await Task.CompletedTask;
        }

        private LoggedInUser ExtractUserFromToken(string accessToken)
        {
            try
            {
                var tokenHandler = new JsonWebTokenHandler();
                var jsonWebToken = tokenHandler.ReadJsonWebToken(accessToken);

                var user = new LoggedInUser
                {
                    Id = GetClaimValue(jsonWebToken, ClaimTypes.NameIdentifier) ?? "",
                    Email = GetClaimValue(jsonWebToken, ClaimTypes.Email) ?? "",
                    Phone = GetClaimValue(jsonWebToken, ClaimTypes.MobilePhone) ?? "",
                    FullName = GetClaimValue(jsonWebToken, ClaimTypes.Name) ?? "",
                    Role = GetClaimValue(jsonWebToken, ClaimTypes.Role) ?? "",
                    ParkingLotId = GetClaimValue(jsonWebToken, "parking_lot_id"),
                    JwtId = GetClaimValue(jsonWebToken, "jti") ?? ""
                };

                System.Diagnostics.Debug.WriteLine($"AuthenticationService: Extracted user info - {user.FullName} ({user.Role}) - Instance: {_instanceId}");

                return user;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"AuthenticationService: Error extracting user from token - Instance: {_instanceId}: {ex.Message}");
                throw new InvalidOperationException("Failed to extract user information from access token");
            }
        }

        private string? GetClaimValue(JsonWebToken token, string claimType)
        {
            return token.GetClaim(claimType)?.Value;
        }

        public void Dispose()
        {
            _refreshSemaphore?.Dispose();
            _httpClient?.Dispose();
        }
    }
}