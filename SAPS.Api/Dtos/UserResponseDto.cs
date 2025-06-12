
using SAPS.Api.Models;

namespace SAPS.Api.Dtos
{
    public class UserResponseDto
    {
        public int Id { get; internal set; }
        public string UserName { get; set; } = default!;
        public TypeRole Role { get;  set; }
    }
}