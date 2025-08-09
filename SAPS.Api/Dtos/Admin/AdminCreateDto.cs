namespace SAPS.Api.Dtos.Admin
{
    public class AdminCreateDto
    {
        public string Email { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string Phone { get; set; } = null!;
    }
}