using System;
using System.Collections.Generic;

namespace SAPS.Api.Models.Generated;

public partial class Subscription
{
    public string Id { get; set; } = null!;

    public string Name { get; set; } = null!;

    public long Duration { get; set; }

    public string? Description { get; set; }

    public double Price { get; set; }

    public string Status { get; set; } = null!;
}
