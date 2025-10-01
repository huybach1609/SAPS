using System;
using System.Collections.Generic;

namespace SAPLSServer.Models;

public partial class Subscription
{
    public string Id { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public long Duration { get; set; }

    public double Price { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string? CreatedBy { get; set; }

    public string? UpdatedBy { get; set; }

    public virtual AdminProfile? CreatedByNavigation { get; set; }

    public virtual ICollection<ParkingLot> ParkingLots { get; set; } = new List<ParkingLot>();

    public virtual AdminProfile? UpdatedByNavigation { get; set; }
}
