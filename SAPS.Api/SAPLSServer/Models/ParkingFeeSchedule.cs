using System;
using System.Collections.Generic;

namespace SAPLSServer.Models;

public partial class ParkingFeeSchedule
{
    public string Id { get; set; } = null!;

    public int StartTime { get; set; }

    public int EndTime { get; set; }

    public decimal InitialFee { get; set; }

    public int InitialMinutes { get; set; }

    public decimal AdditionalFee { get; set; }

    public int AdditionalMinutes { get; set; }

    public string DayOfWeeks { get; set; } = null!;

    public bool IsActive { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string ForVehicleType { get; set; } = null!;

    public string ParkingLotId { get; set; } = null!;

    public virtual ParkingLot ParkingLot { get; set; } = null!;

    public virtual ICollection<ParkingSession> ParkingSessions { get; set; } = new List<ParkingSession>();
}
