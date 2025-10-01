using System;
using System.Collections.Generic;

namespace SAPLSServer.Models;

public partial class ParkingLotShift
{
    public string Id { get; set; } = null!;

    public int StartTime { get; set; }

    public int EndTime { get; set; }

    public string ShiftType { get; set; } = null!;

    public string DayOfWeeks { get; set; } = null!;

    public string Status { get; set; } = null!;

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string ParkingLotId { get; set; } = null!;

    public virtual ParkingLot ParkingLot { get; set; } = null!;

    public virtual ICollection<StaffProfile> StaffUsers { get; set; } = new List<StaffProfile>();
}
