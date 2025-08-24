using System;
using System.Collections.Generic;

namespace SAPS.Api.Models.Generated;

public partial class IncidenceEvidence
{
    public string Id { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string FileName { get; set; } = null!;

    public string IncidenceReportId { get; set; } = null!;

    public virtual AttachedFile IdNavigation { get; set; } = null!;

    public virtual IncidenceReport IncidenceReport { get; set; } = null!;
}
