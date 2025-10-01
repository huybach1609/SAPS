using System;
using System.Collections.Generic;

namespace SAPLSServer.Models;

public partial class SharedVehicle
{
    public string Id { get; set; } = null!;

    public string VehicleId { get; set; } = null!;

    public int? AccessDuration { get; set; }

    public DateTime InviteAt { get; set; }

    public DateTime? AcceptAt { get; set; }

    public DateTime? ExpireAt { get; set; }

    public string? Note { get; set; }

    public string? SharedPersonId { get; set; }

    public virtual ClientProfile? SharedPerson { get; set; }

    public virtual Vehicle Vehicle { get; set; } = null!;
}
