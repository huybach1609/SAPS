using SAPLDesktopApp.DTOs.Concrete.UserDtos;
using SAPLDesktopApp.Models;
using System;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    public interface IAuthenticationService : IDisposable
    {
        Task LoginAsync(AuthenticateUserRequest request);
        Task LogoutAsync();
        Task RefreshAccessTokenAsync(RefreshTokenRequest request);
        bool IsAuthenticated { get; }
        LoggedInUser? CurrentUser { get; }
        AuthenticationToken? CurrentToken { get; }
        string? AccessToken { get; }
        string? GetAuthorizationHeader();
        
        // New refresh token methods
        Task<string?> GetAuthorizationHeaderAsync();
        Task EnsureValidTokenAsync();
        bool CanRefreshToken();
        TimeSpan? TimeUntilTokenExpiry();
        bool WillTokenExpireSoon(TimeSpan within);
    }
}