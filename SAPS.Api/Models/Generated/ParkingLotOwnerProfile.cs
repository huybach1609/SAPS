using System;
using System.Collections.Generic;

namespace SAPS.Api.Models.Generated;

public partial class ParkingLotOwnerProfile
{
    public string UserId { get; set; } = null!;

    public string ParkingLotOwnerId { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string ParkingLotId { get; set; } = null!;

    public virtual ParkingLot ParkingLot { get; set; } = null!;

    public virtual ICollection<PaymentSource> PaymentSources { get; set; } = new List<PaymentSource>();

    public virtual User User { get; set; } = null!;
}
