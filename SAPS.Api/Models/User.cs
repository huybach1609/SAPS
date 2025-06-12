namespace SAPS.Api.Models
{
    public class User
    {
        public int UserId { get; set; }

        public string GoogleId { get; set; } = null!;

        public string? Username { get; set; }

        public string? Password { get; set; }

        public string Email { get; set; } = null!;

        public string? Name { get; set; }

        public string? ProfilePictureUrl { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public bool? IsActive { get; set; }

        public TypeRole Role { get; set; }

    }
    public enum TypeRole
    {
        Staff,
        Admin
    }

}


