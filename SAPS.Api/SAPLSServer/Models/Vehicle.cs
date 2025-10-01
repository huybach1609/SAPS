using System;
using System.Collections.Generic;

namespace SAPLSServer.Models;

public partial class Vehicle
{
    public string Id { get; set; } = null!;

    public string VehicleType { get; set; } = null!;

    public string LicensePlate { get; set; } = null!;

    public string Brand { get; set; } = null!;

    public string Model { get; set; } = null!;

    public string EngineNumber { get; set; } = null!;

    public string ChassisNumber { get; set; } = null!;

    public string Color { get; set; } = null!;

    public string OwnerVehicleFullName { get; set; } = null!;

    public string Status { get; set; } = null!;

    public string SharingStatus { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string OwnerId { get; set; } = null!;

    public string? CurrentHolderId { get; set; }

    public string? FrontVehicleRegistrationCertificateUrl { get; set; }

    public string? BackVehicleRegistrationCertificateUrl { get; set; }

    public string? UpdatedBy { get; set; }

    public virtual ClientProfile? CurrentHolder { get; set; }

    public virtual ClientProfile Owner { get; set; } = null!;

    public virtual ICollection<ParkingSession> ParkingSessions { get; set; } = new List<ParkingSession>();

    public virtual ICollection<SharedVehicle> SharedVehicles { get; set; } = new List<SharedVehicle>();

    public virtual AdminProfile? UpdatedByNavigation { get; set; }
}
