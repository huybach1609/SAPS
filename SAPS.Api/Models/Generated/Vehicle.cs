using System;
using System.Collections.Generic;

namespace SAPS.Api.Models.Generated;

public partial class Vehicle
{
    public string Id { get; set; } = null!;

    public string LicensePlate { get; set; } = null!;

    public string Brand { get; set; } = null!;

    public string Model { get; set; } = null!;

    public string EngineNumber { get; set; } = null!;

    public string ChassisNumber { get; set; } = null!;

    public string Color { get; set; } = null!;

    public string OwnerVehicleFullName { get; set; } = null!;

    public string Status { get; set; } = null!;

    public string OwnerId { get; set; } = null!;

    public virtual ClientProfile Owner { get; set; } = null!;

    public virtual ICollection<ParkingSession> ParkingSessions { get; set; } = new List<ParkingSession>();

    public virtual ICollection<SharedVehicleRequest> SharedVehicleRequests { get; set; } = new List<SharedVehicleRequest>();

    public virtual ICollection<SharedVehicle> SharedVehicles { get; set; } = new List<SharedVehicle>();
}
