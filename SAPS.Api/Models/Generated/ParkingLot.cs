using System;
using System.Collections.Generic;

namespace SAPS.Api.Models.Generated;

public partial class ParkingLot
{
    public string Id { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public string Address { get; set; } = null!;

    public int TotalParkingSlot { get; set; }

    public string Status { get; set; } = null!;

    public virtual ICollection<ParkingFeeSchedule> ParkingFeeSchedules { get; set; } = new List<ParkingFeeSchedule>();

    public virtual ICollection<ParkingLotOwnerProfile> ParkingLotOwnerProfiles { get; set; } = new List<ParkingLotOwnerProfile>();

    public virtual ICollection<ParkingSession> ParkingSessions { get; set; } = new List<ParkingSession>();

    public virtual ICollection<ShiftDiary> ShiftDiaries { get; set; } = new List<ShiftDiary>();

    public virtual ICollection<StaffProfile> StaffProfiles { get; set; } = new List<StaffProfile>();

    public virtual ICollection<WhiteList> WhiteLists { get; set; } = new List<WhiteList>();
}
