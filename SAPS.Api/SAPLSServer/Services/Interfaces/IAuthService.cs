using SAPLSServer.DTOs.Concrete.UserDtos;

namespace SAPLSServer.Services.Interfaces
{
    /// <summary>
    /// Provides authentication services for users and client profiles.
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Authenticates am admin or parking lot owner using email and password.
        /// </summary>
        /// <param name="request">The authentication request containing user credentials.</param>
        /// <returns>An <see cref="AuthenticateUserResponse"/> if authentication is successful; otherwise, <see langword="null"/>.</returns>
        Task<AuthenticateUserResponse?> AuthenticateAdminAndParkingLotOwner(AuthenticateUserRequest request);
        /// <summary>
        /// Authenticates a staff member based on the provided credentials.
        /// </summary>
        /// <param name="request">The authentication request containing the staff member's credentials and other required information.</param>
        /// <returns>An <see cref="AuthenticateUserResponse"/> object containing authentication details if the credentials are
        /// valid; otherwise, <see langword="null"/> if authentication fails.</returns>
        Task<AuthenticateUserResponse?> AuthenticateStaff(AuthenticateUserRequest request);

        /// <summary>
        /// Authenticates a client profile using email, password, and optionally citizen ID.
        /// </summary>
        /// <param name="request">The authentication request for a client profile.</param>
        /// <returns>An <see cref="AuthenticateUserResponse"/> if authentication is successful; otherwise, <see langword="null"/>.</returns>
        Task<AuthenticateUserResponse?> AuthenticateClientProfile(AuthenticateClientProfileRequest request);
        /// <summary>
        /// Authenticates a user using Google OAuth access token.
        /// </summary>
        /// <param name="request">The Google OAuth authentication request.</param>
        /// <returns>An <see cref="AuthenticateUserResponse"/> if authentication is successful; otherwise, <see langword="null"/>.</returns>
        Task<AuthenticateUserResponse?> AuthenticateWithGoogle(GoogleAuthRequest request);

        /// <summary>
        /// Refreshes an access token using a valid refresh token.
        /// </summary>
        /// <param name="request">The refresh token request.</param>
        /// <returns>A new authentication response if successful; otherwise, null.</returns>
        Task<AuthenticateUserResponse?> RefreshToken(string userId, RefreshTokenRequest request);
    }
}