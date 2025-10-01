using System;
using System.Collections.Generic;

namespace SAPLSServer.Models;

public partial class User
{
    public string Id { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string FullName { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public string? ProfileImageUrl { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string? OneTimePassword { get; set; }

    public string? GoogleId { get; set; }

    public string? RefreshToken { get; set; }

    public DateTime? RefreshTokenExpiresAt { get; set; }

    public string Role { get; set; } = null!;

    public virtual AdminProfile? AdminProfile { get; set; }

    public virtual ClientProfile? ClientProfile { get; set; }

    public virtual ParkingLotOwnerProfile? ParkingLotOwnerProfile { get; set; }

    public virtual ICollection<Request> Requests { get; set; } = new List<Request>();

    public virtual StaffProfile? StaffProfile { get; set; }
}
