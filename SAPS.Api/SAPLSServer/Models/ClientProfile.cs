using System;
using System.Collections.Generic;

namespace SAPLSServer.Models;

public partial class ClientProfile
{
    public string UserId { get; set; } = null!;

    public string CitizenId { get; set; } = null!;

    public DateOnly DateOfBirth { get; set; }

    public bool Sex { get; set; }

    public string Nationality { get; set; } = null!;

    public string PlaceOfOrigin { get; set; } = null!;

    public string PlaceOfResidence { get; set; } = null!;

    public string ShareCode { get; set; } = null!;

    public string? DeviceToken { get; set; }

    public string? FrontCitizenIdCardImageUrl { get; set; }

    public string? BackCitizenIdCardImageUrl { get; set; }

    public string? UpdatedBy { get; set; }

    public virtual ICollection<ParkingSession> ParkingSessions { get; set; } = new List<ParkingSession>();

    public virtual ICollection<SharedVehicle> SharedVehicles { get; set; } = new List<SharedVehicle>();

    public virtual AdminProfile? UpdatedByNavigation { get; set; }

    public virtual User User { get; set; } = null!;

    public virtual ICollection<Vehicle> VehicleCurrentHolders { get; set; } = new List<Vehicle>();

    public virtual ICollection<Vehicle> VehicleOwners { get; set; } = new List<Vehicle>();

    public virtual ICollection<WhiteList> WhiteLists { get; set; } = new List<WhiteList>();
}
