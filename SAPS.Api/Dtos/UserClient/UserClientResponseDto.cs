namespace SAPS.Api.Dtos.UserClient
{
    public class UserClientResponseDto
    {
        public string Id { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string CreatedAt { get; set; } = null!;
        public string Status { get; set; } = null!;
    }
}