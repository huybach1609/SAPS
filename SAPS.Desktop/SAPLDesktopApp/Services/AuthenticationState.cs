using SAPLDesktopApp.Models;
using System;

namespace SAPLDesktopApp.Services
{
    /// <summary>
    /// Static authentication state management for the application
    /// </summary>
    public static class AuthenticationState
    {
        private static LoggedInUser? _currentUser;
        private static AuthenticationToken? _currentToken;

        /// <summary>
        /// Current authenticated user
        /// </summary>
        public static LoggedInUser? CurrentUser => _currentUser;

        /// <summary>
        /// Current authentication token
        /// </summary>
        public static AuthenticationToken? CurrentToken => _currentToken;

        /// <summary>
        /// Access token from current token
        /// </summary>
        public static string? AccessToken => _currentToken?.AccessToken;

        /// <summary>
        /// Whether user is currently authenticated
        /// </summary>
        public static bool IsAuthenticated => _currentUser != null && _currentToken != null && !_currentToken.IsExpired;

        /// <summary>
        /// Get authorization header string
        /// </summary>
        public static string? GetAuthorizationHeader()
        {
            return _currentToken?.AuthorizationHeader;
        }

        /// <summary>
        /// Set authentication state
        /// </summary>
        internal static void SetAuthenticationState(LoggedInUser user, AuthenticationToken token)
        {
            _currentUser = user;
            _currentToken = token;
            System.Diagnostics.Debug.WriteLine($"AuthenticationState: State set for user {user.Email}, token expires at {token.ExpiresAt}");
        }

        /// <summary>
        /// Update token information while preserving user
        /// </summary>
        internal static void UpdateToken(AuthenticationToken token)
        {
            _currentToken = token;
            System.Diagnostics.Debug.WriteLine($"AuthenticationState: Token updated, expires at {token.ExpiresAt}");
        }

        /// <summary>
        /// Update user information while preserving token
        /// </summary>
        internal static void UpdateUser(LoggedInUser user)
        {
            _currentUser = user;
            System.Diagnostics.Debug.WriteLine($"AuthenticationState: User updated to {user.Email}");
        }

        /// <summary>
        /// Clear all authentication state
        /// </summary>
        internal static void ClearAuthenticationState()
        {
            _currentUser = null;
            _currentToken = null;
            System.Diagnostics.Debug.WriteLine("AuthenticationState: All state cleared");
        }

        /// <summary>
        /// Check if refresh token is available and valid
        /// </summary>
        public static bool CanRefreshToken()
        {
            return _currentToken != null && !string.IsNullOrEmpty(_currentToken.RefreshToken);
        }

        /// <summary>
        /// Get time until token expires
        /// </summary>
        public static TimeSpan? TimeUntilTokenExpiry()
        {
            if (_currentToken == null)
                return null;

            var timeRemaining = _currentToken.ExpiresAt - DateTime.UtcNow;
            return timeRemaining > TimeSpan.Zero ? timeRemaining : TimeSpan.Zero;
        }

        /// <summary>
        /// Check if token will expire soon (within specified timespan)
        /// </summary>
        public static bool WillTokenExpireSoon(TimeSpan within)
        {
            if (_currentToken == null)
                return true;

            return _currentToken.ExpiresAt <= DateTime.UtcNow.Add(within);
        }
    }
}