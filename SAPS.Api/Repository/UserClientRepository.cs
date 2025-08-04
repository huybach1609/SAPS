using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SAPS.Api.Dtos.UserClient;
using SAPS.Api.Models.Generated;

namespace SAPS.Api.Repository
{
    public class UserClientRepository : IUserClientRepository
    {
        private readonly SapsContext _context;
        private readonly IMapper _mapper;

        public UserClientRepository(SapsContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<UserClientResponseDto>> GetAllUserClientsAsync()
        {
            // Get all users with Client role and their profile information
            var clientUsers = await _context.Users
                .Include(u => u.Roles)
                .Include(u => u.ClientProfile)
                .Where(u => u.Roles.Any(r => r.Name.ToLower() == "user_client"))
                .ToListAsync();

            var userClientDtos = clientUsers.Select(user => new UserClientResponseDto
            {
                Id = user.Id,
                FullName = user.FullName ?? "N/A",
                Email = user.Email ?? "N/A",
                CreatedAt = user.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                Status = user.IsActive ? "active" : "inactive"
            });

            return userClientDtos;
        }

        public async Task<UserClientDetailDto?> GetUserClientDetailByIdAsync(string id)
        {
            var user = await _context.Users
                .Include(u => u.Roles)
                .Include(u => u.ClientProfile)
                .FirstOrDefaultAsync(u => u.Id == id && u.Roles.Any(r => r.Name.ToLower() == "user_client"));

            if (user == null || user.ClientProfile == null)
                return null;

            // Get vehicles owned by this user
            var vehicles = await _context.Vehicles
                .Where(v => v.OwnerId == id)
                .ToListAsync();

            // Get shared vehicles where this user is the shared person
            var sharedVehicles = await _context.SharedVehicles
                .Include(sv => sv.Vehicle)
                .ThenInclude(v => v.Owner)
                .ThenInclude(o => o.User)
                .Where(sv => sv.SharedPersonId == id)
                .ToListAsync();

            // Get parking sessions where this user is the driver
            var parkingSessions = await _context.ParkingSessions
                .Include(ps => ps.Vehicle)
                .Include(ps => ps.ParkingLot)
                .Where(ps => ps.DriverId == id)
                .OrderByDescending(ps => ps.EntryDateTime)
                .ToListAsync();

            // Calculate statistics
            var totalParkingSessions = parkingSessions.Count;
            var totalSpent = parkingSessions.Sum(ps => ps.Cost);
            var completedSessions = parkingSessions.Where(ps => ps.ExitDateTime.HasValue).ToList();
            var avgSessionDuration = completedSessions.Any() 
                ? completedSessions.Average(ps => (ps.ExitDateTime!.Value - ps.EntryDateTime).TotalHours)
                : 0;

            var userClientDetailDto = new UserClientDetailDto
            {
                Id = user.Id,
                FullName = user.FullName ?? "N/A",
                Email = user.Email ?? "N/A",
                ProfileImageUrl = user.ProfileImageUrl,
                Status = user.IsActive ? "active" : "inactive",
                VerificationStatus = "Verified",
                CitizenId = MaskCitizenId(user.ClientProfile?.CitizenId),
                Phone = user.Phone,
                DateOfBirth = user.ClientProfile?.DateOfBirth.ToString("MMMM dd, yyyy"),
                Address = user.ClientProfile?.PlaceOfResidence,
                RegistrationDate = user.CreatedAt.ToString("MMMM dd, yyyy"),
                LastLogin = user.UpdatedAt.ToString("MMMM dd, yyyy - HH:mm tt"),
                Vehicles = vehicles.Select(v => new VehicleInfoDto
                {
                    LicensePlate = v.LicensePlate,
                    Model = $"{v.Brand} {v.Model}",
                    Color = v.Color,
                    RegistrationDate = "N/A", // Vehicle doesn't have creation date in the model
                    Status = v.Status.ToLower()
                }).ToList(),
                SharedVehicles = sharedVehicles.Select(sv => new SharedVehicleInfoDto
                {
                    LicensePlate = sv.Vehicle.LicensePlate,
                    Model = $"{sv.Vehicle.Brand} {sv.Vehicle.Model}",
                    Color = sv.Vehicle.Color,
                    RegistrationDate = sv.InviteAt.ToString("MMM dd, yyyy"),
                    Owner = $"{sv.Vehicle.Owner.User.FullName} (USER-{sv.Vehicle.Owner.User.Id.Substring(0, Math.Min(8, sv.Vehicle.Owner.User.Id.Length)).ToUpper()})",
                    AccessType = sv.AccessDuration.HasValue ? "Temporary Access" : "Permanent Access",
                    Status = sv.ExpireAt.HasValue && sv.ExpireAt < DateTime.UtcNow ? "expired" : "active"
                }).ToList(),
                ParkingActivity = parkingSessions.Take(10).Select(ps => new ParkingActivityDto
                {
                    Date = ps.EntryDateTime.ToString("MMM dd, yyyy"),
                    Location = ps.ParkingLot?.Name ?? "Unknown Location",
                    Vehicle = ps.Vehicle?.LicensePlate ?? "N/A",
                    Duration = ps.ExitDateTime.HasValue 
                        ? FormatDuration(ps.ExitDateTime.Value - ps.EntryDateTime)
                        : "In Progress",
                    Amount = ps.Cost.ToString("C")
                }).ToList(),
                Stats = new UserStatsDto
                {
                    TotalParkingSessions = totalParkingSessions,
                    TotalSpent = totalSpent.ToString("C"),
                    AvgSessionDuration = $"{avgSessionDuration:F1}h"
                }
            };

            return userClientDetailDto;
        }

        public async Task<bool> BanOrUnbanUserClientAccountAsync(string id)
        {
            var user = await _context.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.Id == id && u.Roles.Any(r => r.Name.ToLower() == "user_client"));

            if (user == null)
                return false;

            // Set user as inactive (banned)
            user.IsActive = !user.IsActive;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        private string MaskCitizenId(string? citizenId)
        {
            if (string.IsNullOrEmpty(citizenId))
                return null;

            if (citizenId.Length <= 4)
                return citizenId;

            return "********" + citizenId.Substring(citizenId.Length - 4);
        }

        private string FormatDuration(TimeSpan duration)
        {
            if (duration.TotalDays >= 1)
                return $"{(int)duration.TotalDays}d {duration.Hours}h {duration.Minutes}m";
            else if (duration.TotalHours >= 1)
                return $"{(int)duration.TotalHours}h {duration.Minutes}m";
            else
                return $"{duration.Minutes}m";
        }
    }
}