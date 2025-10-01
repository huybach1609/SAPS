using System;
using System.Collections.Generic;

namespace SAPLSServer.Models;

public partial class AdminProfile
{
    public string UserId { get; set; } = null!;

    public string AdminId { get; set; } = null!;

    public string Role { get; set; } = null!;

    public string? CreatedBy { get; set; }

    public string? UpdatedBy { get; set; }

    public virtual ICollection<ClientProfile> ClientProfiles { get; set; } = new List<ClientProfile>();

    public virtual AdminProfile? CreatedByNavigation { get; set; }

    public virtual ICollection<AdminProfile> InverseCreatedByNavigation { get; set; } = new List<AdminProfile>();

    public virtual ICollection<AdminProfile> InverseUpdatedByNavigation { get; set; } = new List<AdminProfile>();

    public virtual ICollection<ParkingLot> ParkingLotCreatedByNavigations { get; set; } = new List<ParkingLot>();

    public virtual ICollection<ParkingLotOwnerProfile> ParkingLotOwnerProfileCreatedByNavigations { get; set; } = new List<ParkingLotOwnerProfile>();

    public virtual ICollection<ParkingLotOwnerProfile> ParkingLotOwnerProfileUpdatedByNavigations { get; set; } = new List<ParkingLotOwnerProfile>();

    public virtual ICollection<ParkingLot> ParkingLotUpdatedByNavigations { get; set; } = new List<ParkingLot>();

    public virtual ICollection<Request> Requests { get; set; } = new List<Request>();

    public virtual ICollection<Subscription> SubscriptionCreatedByNavigations { get; set; } = new List<Subscription>();

    public virtual ICollection<Subscription> SubscriptionUpdatedByNavigations { get; set; } = new List<Subscription>();

    public virtual AdminProfile? UpdatedByNavigation { get; set; }

    public virtual User User { get; set; } = null!;

    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}
