namespace SAPLSServer.Services.Interfaces
{
    public interface IOtpService
    {
        /// <summary>
        /// Validates if an OTP is valid for a specific user
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <param name="otp">The OTP to validate</param>
        /// <returns>True if the OTP is valid, false otherwise</returns>
        Task<bool> IsOtpValid(string userId, string otp);

        /// <summary>
        /// Generates a new OTP
        /// </summary>
        /// <param name="length">The length of the OTP</param>
        /// <param name="expirationMinutes">Expiration time in minutes</param>
        /// <returns>The generated OTP</returns>
        string GenerateOtp(int length, int expirationMinutes);
    }
}