using System;
using System.Collections.Generic;

namespace SAPLSServer.Models;

public partial class IncidenceReport
{
    public string Id { get; set; } = null!;

    public string Header { get; set; } = null!;

    public DateTime ReportedDate { get; set; }

    public string Priority { get; set; } = null!;

    public string Description { get; set; } = null!;

    public string Status { get; set; } = null!;

    public string? ReporterId { get; set; }

    public string ParkingLotId { get; set; } = null!;

    public virtual ICollection<IncidenceEvidence> IncidenceEvidences { get; set; } = new List<IncidenceEvidence>();

    public virtual ParkingLot ParkingLot { get; set; } = null!;

    public virtual StaffProfile? Reporter { get; set; }
}
