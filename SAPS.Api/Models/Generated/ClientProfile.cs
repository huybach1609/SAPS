using System;
using System.Collections.Generic;

namespace SAPS.Api.Models.Generated;

public partial class ClientProfile
{
    public string UserId { get; set; } = null!;

    public string CitizenId { get; set; } = null!;

    public DateOnly DateOfBirth { get; set; }

    public bool Sex { get; set; }

    public string Nationality { get; set; } = null!;

    public string PlaceOfOrigin { get; set; } = null!;

    public string PlaceOfResidence { get; set; } = null!;

    public string Status { get; set; } = null!;

    public virtual ICollection<SharedVehicleRequest> SharedVehicleRequests { get; set; } = new List<SharedVehicleRequest>();

    public virtual User User { get; set; } = null!;

    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();

    public virtual ICollection<WhiteList> WhiteLists { get; set; } = new List<WhiteList>();
}
