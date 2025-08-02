using System;
using System.Collections.Generic;

namespace SAPS.Api.Models.Generated;

public partial class PaymentSource
{
    public int Id { get; set; }

    public string BankName { get; set; } = null!;

    public string AccountName { get; set; } = null!;

    public string AccountNumber { get; set; } = null!;

    public string ParkingLotOwnerId { get; set; } = null!;

    public virtual ParkingLotOwnerProfile ParkingLotOwner { get; set; } = null!;
}
