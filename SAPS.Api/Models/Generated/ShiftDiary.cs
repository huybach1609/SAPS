using System;
using System.Collections.Generic;

namespace SAPS.Api.Models.Generated;

public partial class ShiftDiary
{
    public string Id { get; set; } = null!;

    public string Header { get; set; } = null!;

    public string Body { get; set; } = null!;

    public string ParkingLotId { get; set; } = null!;

    public string SenderId { get; set; } = null!;

    public virtual ParkingLot ParkingLot { get; set; } = null!;

    public virtual StaffProfile Sender { get; set; } = null!;
}
