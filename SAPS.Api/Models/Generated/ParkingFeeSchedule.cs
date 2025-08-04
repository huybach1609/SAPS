using System;
using System.Collections.Generic;

namespace SAPS.Api.Models.Generated;

public partial class ParkingFeeSchedule
{
    public string Id { get; set; } = null!;

    public int StartTime { get; set; }

    public int EndTime { get; set; }

    public decimal InitialFee { get; set; }

    public decimal AdditionalFee { get; set; }

    public int AdditionalMinutes { get; set; }

    public string? DayOfWeeks { get; set; }

    public bool IsActive { get; set; }

    public string ForVehicleType { get; set; } = null!;

    public string ParkingLotId { get; set; } = null!;

    public virtual ParkingLot ParkingLot { get; set; } = null!;
}
