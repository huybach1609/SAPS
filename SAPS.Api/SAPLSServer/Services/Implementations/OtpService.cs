using SAPLSServer.Constants;
using SAPLSServer.Exceptions;
using SAPLSServer.Repositories.Interfaces;
using SAPLSServer.Services.Interfaces;
using System.Security.Cryptography;

namespace SAPLSServer.Services.Implementations
{
    public class OtpService : IOtpService
    {
        private readonly IUserRepository _userRepository;
        public const int DEFAULT_OTP_DURATION = 15;
        public const int DEFAULT_OTP_LENGTH = 16;

        public OtpService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public string GenerateOtp(int length = DEFAULT_OTP_LENGTH, int expirationMinutes = DEFAULT_OTP_DURATION)
        {
            // Use cryptographically secure random number generator
            using var rng = RandomNumberGenerator.Create();
            var tokenBytes = new byte[length];
            rng.GetBytes(tokenBytes);
            var randomParts = Convert.ToBase64String(tokenBytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "")
                .Substring(0, length);

            var expirationDate = DateTimeOffset.UtcNow.AddMinutes(expirationMinutes).ToUnixTimeSeconds();
            var rawToken = $"{randomParts}_{expirationDate}";
            var finalTokenBytes = System.Text.Encoding.UTF8.GetBytes(rawToken);
            return Convert.ToBase64String(finalTokenBytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");
        }

        public async Task<bool> IsOtpValid(string userId, string encodedOtp)
        {
            var user = await _userRepository.Find(userId) ?? throw new InvalidInformationException(MessageKeys.USER_NOT_FOUND);
            try
            {
                // Step 1: Check if OTP is set
                if(user.OneTimePassword != encodedOtp)
                {
                    return false;
                }
                // Step 2: Decode the outer encoding
                var decodedOtp = DecodeUrlSafeBase64(encodedOtp);
                var rawToken = System.Text.Encoding.UTF8.GetString(decodedOtp);

                // Step 3: Split timestamp and random part
                var parts = rawToken.Split('_');
                if (parts.Length != 2)
                    return false; // Invalid format

                // Step 4: Parse timestamp
                if (!long.TryParse(parts[1], out var expirationTimestamp))
                    return false; // Invalid timestamp

                // Step 5: Check if expired
                var expirationTime = DateTimeOffset.FromUnixTimeSeconds(expirationTimestamp);
                return DateTimeOffset.UtcNow <= expirationTime;
            }
            catch
            {
                return false; // Any error = expired
            }
        }

        private static byte[] DecodeUrlSafeBase64(string input)
        {
            // Convert URL-safe base64 back to regular base64
            var base64 = input.Replace("-", "+").Replace("_", "/");

            // Add padding if necessary
            while (base64.Length % 4 != 0)
                base64 += "=";

            return Convert.FromBase64String(base64);
        }
    }
}