namespace SAPS.Api.Dtos
{
    public class UserLoginDto
    {
        public string UserName { get; set; } = default!;  // Will be mapped to Email in the user repository
        public string Password { get; set; } = default!;
    }
    
}
