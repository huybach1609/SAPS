using System;
using System.Collections.Generic;

namespace SAPLSServer.Models;

public partial class StaffProfile
{
    public string UserId { get; set; } = null!;

    public string StaffId { get; set; } = null!;

    public string ParkingLotId { get; set; } = null!;

    public virtual ICollection<IncidenceReport> IncidenceReports { get; set; } = new List<IncidenceReport>();

    public virtual ParkingLot ParkingLot { get; set; } = null!;

    public virtual ICollection<ParkingSession> ParkingSessionCheckInStaffs { get; set; } = new List<ParkingSession>();

    public virtual ICollection<ParkingSession> ParkingSessionCheckOutStaffs { get; set; } = new List<ParkingSession>();

    public virtual ICollection<ShiftDiary> ShiftDiaries { get; set; } = new List<ShiftDiary>();

    public virtual User User { get; set; } = null!;

    public virtual ICollection<ParkingLotShift> ParkingLotShifts { get; set; } = new List<ParkingLotShift>();
}
