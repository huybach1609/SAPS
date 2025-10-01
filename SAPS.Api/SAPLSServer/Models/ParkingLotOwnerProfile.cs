using System;
using System.Collections.Generic;

namespace SAPLSServer.Models;

public partial class ParkingLotOwnerProfile
{
    public string UserId { get; set; } = null!;

    public string ParkingLotOwnerId { get; set; } = null!;

    public string? ApiKey { get; set; }

    public string? ClientKey { get; set; }

    public string? CheckSumKey { get; set; }

    public string? CreatedBy { get; set; }

    public string? UpdatedBy { get; set; }

    public virtual AdminProfile? CreatedByNavigation { get; set; }

    public virtual ICollection<ParkingLot> ParkingLots { get; set; } = new List<ParkingLot>();

    public virtual AdminProfile? UpdatedByNavigation { get; set; }

    public virtual User User { get; set; } = null!;
}
