using System;
using System.Collections.Generic;

namespace SAPLSServer.Models;

public partial class ParkingLot
{
    public string Id { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public string Address { get; set; } = null!;

    public int TotalParkingSlot { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string Settings { get; set; } = null!;

    public string Status { get; set; } = null!;

    public string ParkingLotOwnerId { get; set; } = null!;

    public string? SubscriptionId { get; set; }

    public string? TempSubscriptionId { get; set; }

    public int? SubscriptionTransactionId { get; set; }

    public string? SubscriptionTransactionInformation { get; set; }

    public DateTime ExpiredAt { get; set; }

    public string? CreatedBy { get; set; }

    public string? UpdatedBy { get; set; }

    public virtual AdminProfile? CreatedByNavigation { get; set; }

    public virtual ICollection<IncidenceReport> IncidenceReports { get; set; } = new List<IncidenceReport>();

    public virtual ICollection<ParkingFeeSchedule> ParkingFeeSchedules { get; set; } = new List<ParkingFeeSchedule>();

    public virtual ParkingLotOwnerProfile ParkingLotOwner { get; set; } = null!;

    public virtual ICollection<ParkingLotShift> ParkingLotShifts { get; set; } = new List<ParkingLotShift>();

    public virtual ICollection<ParkingSession> ParkingSessions { get; set; } = new List<ParkingSession>();

    public virtual ICollection<ShiftDiary> ShiftDiaries { get; set; } = new List<ShiftDiary>();

    public virtual ICollection<StaffProfile> StaffProfiles { get; set; } = new List<StaffProfile>();

    public virtual Subscription? Subscription { get; set; }

    public virtual AdminProfile? UpdatedByNavigation { get; set; }

    public virtual ICollection<WhiteList> WhiteLists { get; set; } = new List<WhiteList>();
}
