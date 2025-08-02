using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Google.Apis.Auth;
using Microsoft.IdentityModel.Tokens;
using SAPS.Api.Models;
using SAPS.Api.Repository;
using Microsoft.EntityFrameworkCore;

namespace SAPS.Api.Service
{
    public class GoogleAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly IUserRepository _userRepository;
        private readonly Models.Generated.SapsContext _context;

        public GoogleAuthService(IConfiguration config, IUserRepository userRepo, Models.Generated.SapsContext context)
        {
            _configuration = config;
            _userRepository = userRepo;
            _context = context;
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
        
        public async Task<Models.Generated.User> CreateOrUpdateUserAsync(GoogleJsonWebSignature.Payload payload)
        {
            // Tìm user bằng GoogleId
            var existingUser = await _userRepository.GetByGoogleIdAsync(payload.Subject);

            if (existingUser != null)
            {
                // Cập nhật thông tin người dùng
                existingUser.Email = payload.Email;
                existingUser.FullName = payload.Name;
                existingUser.ProfileImageUrl = payload.Picture;
                existingUser.UpdatedAt = DateTime.UtcNow;

                await _userRepository.UpdateAsync(existingUser);
                return existingUser;
            }
            else
            {
                // Tạo người dùng mới
                var newUser = new Models.Generated.User
                {
                    Id = Guid.NewGuid().ToString(),
                    GoogleId = payload.Subject,
                    Email = payload.Email,
                    FullName = payload.Name,
                    ProfileImageUrl = payload.Picture,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsActive = true,
                    Password = "",  // Không cần mật khẩu cho người dùng Google
                    Phone = ""      // Điện thoại mặc định trống
                };
                
                // Gán role Staff mặc định
                var staffRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Staff");
                if (staffRole == null)
                {
                    // Tạo role nếu chưa tồn tại
                    staffRole = new Models.Generated.Role { Name = "Staff" };
                    _context.Roles.Add(staffRole);
                    await _context.SaveChangesAsync();
                }
                
                newUser.Roles = new List<Models.Generated.Role> { staffRole };
                
                await _userRepository.CreateAsync(newUser);
                return newUser;
            }
        }

        public string GenerateJwtToken(Models.Generated.User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim("google_id", user.GoogleId ?? "")
            };
            
            // Thêm roles vào claims
            if (user.Roles != null)
            {
                foreach (var role in user.Roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role.Name));
                }
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(24),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
