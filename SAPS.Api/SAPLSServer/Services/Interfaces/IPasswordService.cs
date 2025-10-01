using SAPLSServer.DTOs.Concrete.UserDtos;

namespace SAPLSServer.Services.Interfaces
{
    /// <summary>
    /// Provides password management operations for users.
    /// </summary>
    public interface IPasswordService
    {
        /// <summary>
        /// Verifies whether the provided plain text password matches the specified hashed password.
        /// </summary>
        /// <param name="password">The plain text password to verify.</param>
        /// <param name="hashedPassword">The hashed password to compare against.</param>
        /// <returns>True if the password matches; otherwise, false.</returns>
        bool VerifyPassword(string password, string hashedPassword);

        /// <summary>
        /// Hashes a plain text password using a secure algorithm.
        /// </summary>
        /// <param name="password">The plain text password to hash.</param>
        /// <returns>The hashed password string.</returns>
        string HashPassword(string password);

        /// <summary>
        /// Updates a user's password after verifying the old password.
        /// </summary>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <param name="request">The password update request containing old and new passwords.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task UpdatePassword(string userId, UpdateUserPasswordRequest request);

        /// <summary>
        /// Initiates a password reset request by generating and sending an OTP to the user's email.
        /// </summary>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task RequestResetPassword(string userId);

        /// <summary>
        /// Resets a user's password using a valid OTP and new password.
        /// </summary>
        /// <param name="request">The reset password request containing user ID, OTP, and new password.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task ResetPassword(ResetUserPasswordRequest request);
        Task RequestResetPasswordByEmail(string userId);
        string RandomizePassword(int minLength = 8, int maxLength = 24);
    }
}
