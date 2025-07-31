using System;
using System.Collections.Generic;

namespace SAPS.Api.Models.Generated;

public partial class IncidenceReport
{
    public string Id { get; set; } = null!;

    public string Header { get; set; } = null!;

    public DateTime ReportedDate { get; set; }

    public string Priority { get; set; } = null!;

    public string Description { get; set; } = null!;

    public string Status { get; set; } = null!;

    public string ReporterId { get; set; } = null!;

    public virtual ICollection<IncidenceEvidence> IncidenceEvidences { get; set; } = new List<IncidenceEvidence>();

    public virtual StaffProfile Reporter { get; set; } = null!;
}
