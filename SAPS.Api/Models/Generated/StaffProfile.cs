using System;
using System.Collections.Generic;

namespace SAPS.Api.Models.Generated;

public partial class StaffProfile
{
    public string UserId { get; set; } = null!;

    public string StaffId { get; set; } = null!;

    public string Status { get; set; } = null!;

    public string ParkingLotId { get; set; } = null!;

    public virtual ICollection<IncidenceReport> IncidenceReports { get; set; } = new List<IncidenceReport>();

    public virtual ParkingLot ParkingLot { get; set; } = null!;

    public virtual ICollection<ShiftDiary> ShiftDiaries { get; set; } = new List<ShiftDiary>();

    public virtual User User { get; set; } = null!;
}
