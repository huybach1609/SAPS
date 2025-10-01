using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.UserDtos;
using SAPLSServer.DTOs.Concrete.FileUploadDtos;
using SAPLSServer.Exceptions;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using SAPLSServer.Services.Interfaces;

namespace SAPLSServer.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordService _passwordService;
        private readonly IOtpService _otpService;
        private readonly IMailSenderService _mailSenderService;
        private readonly IFileService _fileService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public const string UserRegistrationSubject = "Welcome to SAPLS - Confirm your account";
        public const int CONFIRMATION_EXPIRATION_MINUTES = 15;

        public UserService(IUserRepository userRepository, IPasswordService passwordService, IOtpService otpService, IMailSenderService mailSenderService, IFileService fileService, IHttpContextAccessor httpContextAccessor)
        {
            _userRepository = userRepository;
            _passwordService = passwordService;
            _otpService = otpService;
            _mailSenderService = mailSenderService;
            _fileService = fileService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<string> Create(CreateUserRequest request, UserRole role)
        {
            // Check for unique Email
            bool emailExists = await _userRepository.ExistsAsync(u => u.Email == request.Email);
            bool phoneExists = await _userRepository.ExistsAsync(u => u.Phone == request.Phone);
            if (emailExists)
                throw new InvalidInformationException(MessageKeys.EMAIL_ALREADY_EXISTS);
            if (phoneExists)
                throw new InvalidInformationException(MessageKeys.PHONE_ALREADY_EXISTS);

            var userId = Guid.NewGuid().ToString();

            // Upload profile image if provided
            string? profileImageUrl = null;
            if (request.ProfileImage != null)
            {
                var profileImageUploadRequest = new FileUploadRequest
                {
                    File = request.ProfileImage,
                    Container = "profile-images",
                    SubFolder = $"user-{userId}",
                    GenerateUniqueFileName = true,
                    Metadata = new Dictionary<string, string>
                    {
                        { "UserId", userId },
                        { "ImageType", "ProfileImage" }
                    }
                };

                var profileImageResult = await _fileService.UploadFileAsync(profileImageUploadRequest);
                profileImageUrl = profileImageResult.CloudUrl;
            }

            // Generate confirmation OTP
            var confirmationOtp = _otpService.GenerateOtp(OtpService.DEFAULT_OTP_LENGTH, 
                OtpService.DEFAULT_OTP_DURATION);

            var user = new User
            {
                Id = userId,
                Email = request.Email,
                Password = _passwordService.HashPassword(request.Password),
                FullName = request.FullName,
                Phone = request.Phone,
                ProfileImageUrl = profileImageUrl,
                Status = UserStatus.Inactive.ToString(),
                Role = role.ToString(),
                OneTimePassword = confirmationOtp,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();
            try
            {
                if (role == UserRole.Staff || role == UserRole.Admin || role == UserRole.ParkingLotOwner)
                {
                    await SendConfirmationEmail(user, request.Password);
                }
                // Send confirmation email
                else
                {
                    await SendConfirmationEmail(user);
                }
            }
            catch(Exception)
            {
                _userRepository.Remove(user);
                await _userRepository.SaveChangesAsync();
                throw new InvalidInformationException(MessageKeys.EMAIL_NOT_EXIST);
            }
            return user.Id;
        }

        public async Task<UserDetailsDto?> GetById(string userId)
        {
            var user = await _userRepository.Find(userId);
            if(user == null)
                return null;
            return new UserDetailsDto(user);
        }

        public async Task<UserDetailsDto?> GetByPhoneOrEmail(string phoneOrEmail)
        {
            var user = await _userRepository.Find([u => u.Phone == phoneOrEmail || u.Email == phoneOrEmail]);
            if (user == null)
                return null;
            return new UserDetailsDto(user);
        }
         
        public async Task<string> GetPassword(string userId)
        {
            var user = await _userRepository.Find(userId);
            if (user == null)
                throw new InvalidInformationException(MessageKeys.USER_NOT_FOUND);
            return user.Password;
        }

        public async Task UpdateProfileImage(UpdateUserProfileImageRequest request)
        {
            var user = await _userRepository.Find(request.Id);
            if (user == null)
                throw new InvalidInformationException(MessageKeys.USER_NOT_FOUND);

            // Handle profile image update
            if (request.ProfileImage != null)
            {
                // Delete old profile image if exists
                if (!string.IsNullOrWhiteSpace(user.ProfileImageUrl))
                {
                    await _fileService.DeleteFileByUrlAsync(user.ProfileImageUrl);
                }

                // Upload new profile image
                var profileImageUploadRequest = new FileUploadRequest
                {
                    File = request.ProfileImage,
                    Container = "profile-images",
                    SubFolder = $"user-{user.Id}",
                    GenerateUniqueFileName = true,
                    Metadata = new Dictionary<string, string>
                    {
                        { "UserId", user.Id },
                        { "ImageType", "ProfileImage" }
                    }
                };

                var profileImageResult = await _fileService.UploadFileAsync(profileImageUploadRequest);
                user.ProfileImageUrl = profileImageResult.CloudUrl;
            }

            user.UpdatedAt = DateTime.UtcNow;

            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();
        }

        public async Task<UserDetailsDto?> GetByGoogleId(string googleId)
        {
            var user = await _userRepository.Find([u => u.GoogleId == googleId]);
            if(user == null)
                return null;
            return new UserDetailsDto(user);
        }

        public async Task UpdateStatus(UpdateUserStatusRequest request)
        {
            var user = await _userRepository.Find(request.Id);
            if (user == null)
                throw new InvalidInformationException(MessageKeys.USER_NOT_FOUND);
            if (request.Status != UserStatus.Active.ToString() && request.Status != UserStatus.Inactive.ToString())
                throw new InvalidInformationException(MessageKeys.INVALID_USER_STATUS);

            user.Status = request.Status;
            user.UpdatedAt = DateTime.UtcNow;

            // If user is being set to Inactive, clear their refresh token (force logout)
            if (request.Status != UserStatus.Inactive.ToString() 
                || request.Status != UserStatus.Banned.ToString()
                || request.Status != UserStatus.Deleted.ToString())
            {
                await ClearRefreshToken(user.Id);
            }

            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();
        }

        public async Task UpdateGoogleId(string userId, string googleId)
        {
            var user = await _userRepository.Find(userId);
            if (user == null)
                throw new InvalidInformationException(MessageKeys.USER_NOT_FOUND);
            user.GoogleId = googleId;
            user.UpdatedAt = DateTime.UtcNow;

            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();
        }

        public async Task StoreRefreshToken(string userId, string refreshToken, DateTime expiresAt)
        {
            var user = await _userRepository.Find(userId);
            if (user == null)
                throw new InvalidInformationException(MessageKeys.USER_NOT_FOUND);

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiresAt = expiresAt;
            user.UpdatedAt = DateTime.UtcNow;

            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();
        }

        public async Task<UserDetailsDto?> GetByRefreshToken(string refreshToken)
        {
            var user = await _userRepository.Find([u => u.RefreshToken!.Trim() == refreshToken.Trim() &&
                                                  u.RefreshTokenExpiresAt > DateTime.UtcNow &&
                                                  u.Status == UserStatus.Active.ToString()]);
            if (user == null)
                return null;
            
            return new UserDetailsDto(user);
        }

        public async Task ClearRefreshToken(string userId)
        {
            var user = await _userRepository.Find(userId);
            if (user == null)
                throw new InvalidInformationException(MessageKeys.USER_NOT_FOUND);

            user.RefreshToken = null;
            user.RefreshTokenExpiresAt = null;
            user.UpdatedAt = DateTime.UtcNow;

            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();
        }

        private async Task SendConfirmationEmail(User user)
        {
            var request = _httpContextAccessor.HttpContext?.Request;
            var scheme = request?.Scheme ?? "https";
            var host = request?.Host.ToString() ?? "localhost";
            var confirmationLink = $"{scheme}://{host}{UrlPaths.CONFIRM_EMAIL_PATH}?userId={user.Id}&otp={user.OneTimePassword}";

            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Views", "ConfirmationMailTemplate.html");
            
            string content;
            if (System.IO.File.Exists(filePath))
            {
                content = await System.IO.File.ReadAllTextAsync(filePath);
                content = content.Replace("{userFullName}", user.FullName)
                                 .Replace("{confirmationUrl}", confirmationLink)
                                 .Replace("{tokenExpirationMinutes}", CONFIRMATION_EXPIRATION_MINUTES.ToString());
            }
            else
            {
                // Fallback to simple text email if template doesn't exist
                content = $@"
                    <h2>Welcome to SAPLS, {user.FullName}!</h2>
                    <p>Thank you for registering with SAPLS. Please confirm your email address by clicking the link below:</p>
                    <p><a href='{confirmationLink}'>Confirm Email Address</a></p>
                    <p>This confirmation link will expire in {CONFIRMATION_EXPIRATION_MINUTES} minutes.</p>
                    <p>If you did not create this account, please ignore this email.</p>
                ";
            }

            await _mailSenderService.SendEmailAsync(user.Email, UserRegistrationSubject, content);
        }

        private async Task SendConfirmationEmail(User user, string passwword)
        {
            var request = _httpContextAccessor.HttpContext?.Request;
            var scheme = request?.Scheme ?? "https";
            var host = request?.Host.ToString() ?? "localhost";
            var confirmationLink = $"{scheme}://{host}{UrlPaths.CONFIRM_EMAIL_PATH}?userId={user.Id}&otp={user.OneTimePassword}";

            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Views", "ConfirmationMailWithPasswordTemplate.html");

            string content;
            if (System.IO.File.Exists(filePath))
            {
                content = await System.IO.File.ReadAllTextAsync(filePath);
                content = content.Replace("{userFullName}", user.FullName)
                                 .Replace("{confirmationUrl}", confirmationLink)
                                 .Replace("{password}", passwword)
                                 .Replace("{tokenExpirationMinutes}", CONFIRMATION_EXPIRATION_MINUTES.ToString());
            }
            else
            {
                // Fallback to simple text email if template doesn't exist
                content = $@"
                    <h2>Welcome to SAPLS, {user.FullName}!</h2>
                    <h2>Your password is: {passwword}</h2>
                    <p>Thank you for registering with SAPLS. Please confirm your email address by clicking the link below:</p>
                    <p><a href='{confirmationLink}'>Confirm Email Address</a></p>
                    <p>This confirmation link will expire in {CONFIRMATION_EXPIRATION_MINUTES} minutes.</p>
                    <p>If you did not create this account, please ignore this email.</p>
                ";
            }

            await _mailSenderService.SendEmailAsync(user.Email, UserRegistrationSubject, content);
        }

        public async Task<bool> ValidateRefreshToken(string userId, string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                return false;
            }
            var user = await _userRepository.Find(userId);
            if (user == null)
                return false;

            // Check if refresh token matches and is not expired
            return user.RefreshToken!.Trim() == refreshToken.Trim() &&
                   user.RefreshTokenExpiresAt.HasValue && 
                   user.RefreshTokenExpiresAt > DateTime.UtcNow &&
                   user.Status == UserStatus.Active.ToString();
        }

        public async Task<bool> IsUserValid(string userId)
        {
            var user = await _userRepository.Find(userId);
            if (user == null)
                return false;
            return user.Status == UserStatus.Active.ToString();
        }

        public async Task SendNewConfirmationEmail(string email)
        {
            var user = await _userRepository.Find([u => u.Email == email]);
            if (user == null)
                throw new InvalidInformationException(MessageKeys.USER_NOT_FOUND);
            var confirmationOtp = _otpService.GenerateOtp(OtpService.DEFAULT_OTP_LENGTH,
                OtpService.DEFAULT_OTP_DURATION);
            user.OneTimePassword = confirmationOtp;
            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();
            await SendConfirmationEmail(user);
        }

        public async Task Delete(string userId)
        {
           var user = await _userRepository.Find(userId);
              if (user == null)
                 throw new InvalidInformationException(MessageKeys.USER_NOT_FOUND);
            _userRepository.Remove(user);
            await _userRepository.SaveChangesAsync();
        }
    }
}