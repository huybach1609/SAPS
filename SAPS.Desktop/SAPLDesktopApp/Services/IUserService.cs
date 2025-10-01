using SAPLDesktopApp.DTOs.Concrete.UserDtos;
using System;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    /// <summary>
    /// Service for managing user-related operations
    /// </summary>
    public interface IUserService : IDisposable
    {
        /// <summary>
        /// Updates the current user's password
        /// </summary>
        /// <param name="request">Contains old and new password</param>
        /// <returns>True if password was updated successfully, false otherwise</returns>
        Task<bool> UpdatePasswordAsync(UpdateUserPasswordRequest request);

        /// <summary>
        /// Requests a password reset for the specified email address
        /// </summary>
        /// <param name="email">The email address to request password reset for</param>
        /// <returns>True if the reset request was sent successfully</returns>
        Task<bool> RequestResetPasswordAsync(string email);
    }
}