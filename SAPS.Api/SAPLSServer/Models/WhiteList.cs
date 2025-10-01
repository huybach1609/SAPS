using System;
using System.Collections.Generic;

namespace SAPLSServer.Models;

public partial class WhiteList
{
    public string ParkingLotId { get; set; } = null!;

    public string ClientId { get; set; } = null!;

    public DateTime AddedAt { get; set; }

    public DateTime? ExpireAt { get; set; }

    public virtual ClientProfile Client { get; set; } = null!;

    public virtual ParkingLot ParkingLot { get; set; } = null!;
}
