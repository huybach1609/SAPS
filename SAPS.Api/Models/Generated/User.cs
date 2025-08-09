using System;
using System.Collections.Generic;

namespace SAPS.Api.Models.Generated;

public partial class User
{
    public string Id { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string FullName { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public string? ProfileImageUrl { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string? GoogleId { get; set; }

    public virtual ClientProfile? ClientProfile { get; set; }

    public virtual ParkingLotOwnerProfile? ParkingLotOwnerProfile { get; set; }

    public virtual ICollection<Request> Requests { get; set; } = new List<Request>();

    public virtual StaffProfile? StaffProfile { get; set; }

    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();
}
