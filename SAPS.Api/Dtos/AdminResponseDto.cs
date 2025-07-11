namespace SAPS.Api.Dtos {
    public class AdminResponseDto {
        public string Id { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string AdminId { get; set; } = null!;
        public string Role { get; set; } = null!;
        public List<string> Roles { get; set; } = new List<string>();
        public List<string> Permissions { get; set; } = new List<string>();
        public string Status { get; set; } = null!;
        public bool IsActive {
            get; set;
        }
        public DateTime CreatedAt {
            get; set;
        }
        public DateTime UpdatedAt {
            get; set;
        }
    }
}