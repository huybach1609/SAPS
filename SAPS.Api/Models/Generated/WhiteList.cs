using System;
using System.Collections.Generic;

namespace SAPS.Api.Models.Generated;

public partial class WhiteList
{
    public string ParkingLotId { get; set; } = null!;

    public string ClientId { get; set; } = null!;

    public DateOnly AddedDate { get; set; }

    public DateOnly? ExpiredDate { get; set; }

    public virtual ClientProfile Client { get; set; } = null!;

    public virtual ParkingLot ParkingLot { get; set; } = null!;
}
