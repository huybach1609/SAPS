using SAPS.Api.Models.Generated;

namespace SAPS.Api.Dtos
{
    public class UserResponseDto
    {
        public string Id { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string? Phone { get; set; }
        public string? ProfileImageUrl { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string? GoogleId { get; set; }
        
        // Include minimal role info without causing circular references
        public List<string> Roles { get; set; } = new List<string>();
        
        // Include profile type info (Admin, Client, Staff, ParkingLotOwner)
        public string? ProfileType { get; set; }
    }
}