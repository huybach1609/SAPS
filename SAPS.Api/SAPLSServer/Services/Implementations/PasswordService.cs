using Microsoft.AspNetCore.Components.Web;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.UserDtos;
using SAPLSServer.Exceptions;
using SAPLSServer.Repositories.Interfaces;
using SAPLSServer.Services.Interfaces;

namespace SAPLSServer.Services.Implementations
{
    public class PasswordService : IPasswordService
    {
        private readonly IMailSenderService _mailSenderService;
        private readonly IUserRepository _userRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IOtpService _otpService;
        private readonly ILogger<PasswordService> _logger;
        public const string PasswordResetSubject = "Reset SAPLS account's password";
        public const int RESET_PASSWORD_EXPIRATION_MINUTES = 15;

        public PasswordService(IHttpContextAccessor httpContextAccessor, IMailSenderService mailSenderService, 
            IUserRepository userRepository, IOtpService otpService, ILogger<PasswordService> logger)
        {
            _mailSenderService = mailSenderService;
            _userRepository = userRepository;
            _httpContextAccessor = httpContextAccessor;
            _otpService = otpService;
            _logger = logger;
        }

        public async Task ResetPassword(ResetUserPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Otp) 
                || string.IsNullOrWhiteSpace(request.NewPassword) || string.IsNullOrWhiteSpace(request.UserId))
            {
                return; //should not run here
            }

            // Use OtpService to validate the OTP
            bool isOtpValid = await _otpService.IsOtpValid(request.UserId, request.Otp);
            if (!isOtpValid)
            {
                throw new InvalidInformationException(MessageKeys.ACCESS_EXPIRED);
            }

            var user = await _userRepository.Find(request.UserId) ?? throw new InvalidInformationException(MessageKeys.USER_NOT_FOUND);
            user.Password = HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            user.OneTimePassword = null;
            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();
        }

        public async Task RequestResetPassword(string userId)
        {
            var user = await _userRepository.Find(userId) ?? throw new InvalidInformationException(MessageKeys.USER_NOT_FOUND);
            
            // Use OtpService to generate the OTP
            user.OneTimePassword = _otpService.GenerateOtp(OtpService.DEFAULT_OTP_LENGTH, OtpService.DEFAULT_OTP_DURATION);
            user.UpdatedAt = DateTime.UtcNow;
            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();
            
            var request = _httpContextAccessor.HttpContext?.Request;
            var scheme = request?.Scheme ?? "https";
            var host = request?.Host.ToString() ?? "localhost";
            var link = $"{scheme}://{host}{UrlPaths.RESET_PASSWORD_PATH}?userId={user.Id}&otp={user.OneTimePassword}";

            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Views", "ResetPasswordMailTemplate.html");
            _logger.LogInformation("Looking for email template at {FilePath}", filePath);
            if (!System.IO.File.Exists(filePath))
            {
                throw new FileNotFoundException();
            }
            var content = await System.IO.File.ReadAllTextAsync(filePath);
            content = content.Replace("{userFullName}", user.FullName)
                             .Replace("{resetUrl}", link)
                             .Replace("{tokenExpirationMinutes}", RESET_PASSWORD_EXPIRATION_MINUTES.ToString());
            await _mailSenderService.SendEmailAsync(user.Email, PasswordResetSubject, content);
        }

        public async Task UpdatePassword(string userId, UpdateUserPasswordRequest request)
        {
            var user = await _userRepository.Find(userId) ?? throw new InvalidInformationException(MessageKeys.USER_NOT_FOUND);
            if (!VerifyPassword(request.OldPassword, user.Password))
            {
                throw new InvalidInformationException(MessageKeys.WRONG_PASSWORD);
            }
            if(userId != request.Id)
            {
                throw new UnauthorizedAccessException(MessageKeys.UNAUTHORIZED_ACCESS);
            }
            user.Password = HashPassword(request.NewPassword);
            user.OneTimePassword = _otpService.GenerateOtp(OtpService.DEFAULT_OTP_LENGTH, OtpService.DEFAULT_OTP_DURATION);
            _userRepository.Update(user);
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.SaveChangesAsync();
        }

        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt());
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }

        public string RandomizePassword(int minLength = 8, int maxLength = 24)
        {
            const string lower = "abcdefghijklmnopqrstuvwxyz";
            const string upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const string digits = "0123456789";
            const string special = "!@#$%^&*()_+-=[]{};':\"\\|,.<>/?";
            var random = new Random();

            // Ensure at least one character from each required set
            var chars = new List<char>
            {
                lower[random.Next(lower.Length)],
                upper[random.Next(upper.Length)],
                digits[random.Next(digits.Length)],
                special[random.Next(special.Length)]
            };

            // Fill the rest with random chars from all sets
            string all = lower + upper + digits + special;
            int length = random.Next(minLength, maxLength + 1);
            for (int i = chars.Count; i < length; i++)
            {
                chars.Add(all[random.Next(all.Length)]);
            }

            // Shuffle to avoid predictable positions
            chars = chars.OrderBy(_ => random.Next()).ToList();

            return new string(chars.ToArray());
        }

        public async Task RequestResetPasswordByEmail(string email)
        {
            var user = await _userRepository.Find([u => u.Email == email]);
            if (user == null)
            {
                throw new InvalidInformationException(MessageKeys.USER_NOT_FOUND);
            }
            await RequestResetPassword(user.Id);
        }
    }
}
