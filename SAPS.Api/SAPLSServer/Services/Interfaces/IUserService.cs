using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.UserDtos;

namespace SAPLSServer.Services.Interfaces
{
    /// <summary>
    /// Provides core operations for user management, including creation, profile updates, status changes, and retrieval of user details and credentials.
    /// </summary>
    public interface IUserService
    {
        /// <summary>
        /// Registers a new user in the system using the provided information.
        /// </summary>
        /// <param name="request">The request containing user registration details.</param>
        /// <returns>A task that returns the unique identifier of the newly created user.</returns>
        Task<string> Create(CreateUserRequest request, UserRole role);

        /// <summary>
        /// Updates the profile image of the specified user.
        /// </summary>
        /// <param name="request">The request containing the user identifier and new profile image.</param>
        /// <returns>A task representing the asynchronous update operation.</returns>
        Task UpdateProfileImage(UpdateUserProfileImageRequest request);

        /// <summary>
        /// Changes the status of a user (e.g., active, inactive, banned).
        /// </summary>
        /// <param name="request">The request containing the user identifier and new status.</param>
        /// <returns>A task representing the asynchronous status update operation.</returns>
        Task UpdateStatus(UpdateUserStatusRequest request);

        /// <summary>
        /// Retrieves detailed information about a user by their unique identifier.
        /// </summary>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <returns>A task that returns the user's detailed information, or null if not found.</returns>
        Task<UserDetailsDto?> GetById(string userId);

        /// <summary>
        /// Retrieves detailed information about a user by their phone number or email address.
        /// </summary>
        /// <param name="phoneOrEmail">The user's phone number or email address.</param>
        /// <returns>A task that returns the user's detailed information, or null if not found.</returns>
        Task<UserDetailsDto?> GetByPhoneOrEmail(string phoneOrEmail);

        /// <summary>
        /// Retrieves the password hash for the specified user identifier.
        /// </summary>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <returns>A task that returns the password hash for the user.</returns>
        Task<string> GetPassword(string userId);

        /// <summary>
        /// Gets a user by their Google ID.
        /// </summary>
        /// <param name="googleId">The Google ID of the user.</param>
        /// <returns>The user details if found; otherwise, null.</returns>
        Task<UserDetailsDto?> GetByGoogleId(string googleId);

        /// <summary>
        /// Updates the Google ID for an existing user.
        /// </summary>
        /// <param name="userId">The user ID.</param>
        /// <param name="googleId">The Google ID to associate with the user.</param>
        /// <returns>True if successful; otherwise, false.</returns>
        Task UpdateGoogleId(string userId, string googleId);

        /// <summary>
        /// Stores the refresh token for a user.
        /// </summary>
        /// <param name="userId">The user ID.</param>
        /// <param name="refreshToken">The refresh token to store.</param>
        /// <param name="expiresAt">When the refresh token expires.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task StoreRefreshToken(string userId, string refreshToken, DateTime expiresAt);

        /// <summary>
        /// Validates that the provided refresh token matches the stored token for the user and is not expired.
        /// </summary>
        /// <param name="userId">The user ID.</param>
        /// <param name="refreshToken">The refresh token to validate.</param>
        /// <returns>True if the refresh token is valid and not expired; otherwise, false.</returns>
        Task<bool> ValidateRefreshToken(string userId, string refreshToken);

        /// <summary>
        /// Clears the refresh token for a user.
        /// </summary>
        /// <param name="userId">The user ID.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task ClearRefreshToken(string userId);
        /// <summary>
        /// Checks if the specified user is valid and exists in the system.
        /// </summary>
        /// <param name="userId">The user ID to check.</param>
        /// <returns>True if the user exists and is valid; otherwise, false.</returns>
        Task<bool> IsUserValid(string userId);
        Task Delete(string userId);
        Task SendNewConfirmationEmail(string email);
    }
}