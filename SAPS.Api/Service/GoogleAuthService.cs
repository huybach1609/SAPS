using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Google.Apis.Auth;
using Microsoft.IdentityModel.Tokens;
using SAPS.Api.Models;
using SAPS.Api.Repository;

namespace SAPS.Api.Service
{
    public class GoogleAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly IUserRepository _userRepository;

        public GoogleAuthService(IConfiguration config, IUserRepository userRepo)
        {
            _configuration = config;
            _userRepository = userRepo;
        }
        public async Task<GoogleJsonWebSignature.Payload> VerifyGoogleTokenAsync(string idToken)
        {
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = new[] { _configuration["Google:ClientId"] }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
                return payload;
            }
            catch (Exception)
            {
                return null;
            }
        }
        public async Task<User> CreateOrUpdateUserAsync(GoogleJsonWebSignature.Payload payload)
        {
            // get google id and get user from db
            var existingUser = await _userRepository.GetByGoogleIdAsync(payload.Subject);

            if (existingUser != null)
            {
                // Update existing user
                existingUser.Email = payload.Email;
                existingUser.Name = payload.Name;
                existingUser.ProfilePictureUrl = payload.Picture;
                existingUser.UpdatedAt = DateTime.UtcNow;

                await _userRepository.UpdateAsync(existingUser);
                return existingUser;
            }
            else
            {
                // Create new user
                var newUser = new User
                {
                    GoogleId = payload.Subject,
                    Email = payload.Email,
                    Name = payload.Name,
                    ProfilePictureUrl = payload.Picture,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsActive = true
                };
                await _userRepository.CreateAsync(newUser);
                return newUser;
            }
        }

        public string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                // token save userId, email, name and custome claim 'google_id' googleId
                Subject = new ClaimsIdentity(new[]
                {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim("google_id", user.GoogleId)
            }),
                // set time 1day
                Expires = DateTime.UtcNow.AddHours(24),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }


    }
}
