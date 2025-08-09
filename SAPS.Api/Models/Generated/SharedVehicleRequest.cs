using System;
using System.Collections.Generic;

namespace SAPS.Api.Models.Generated;

public partial class SharedVehicleRequest
{
    public string Id { get; set; } = null!;

    public string VehicleId { get; set; } = null!;

    public string Status { get; set; } = null!;

    public string AccessDuration { get; set; } = null!;

    public DateOnly InvitationDate { get; set; }

    public DateOnly ExpirationDate { get; set; }

    public string? Note { get; set; }

    public string SharedPersonId { get; set; } = null!;

    public virtual ClientProfile SharedPerson { get; set; } = null!;

    public virtual Vehicle Vehicle { get; set; } = null!;
}
