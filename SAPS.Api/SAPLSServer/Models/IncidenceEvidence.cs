using System;
using System.Collections.Generic;

namespace SAPLSServer.Models;

public partial class IncidenceEvidence
{
    public string AttachedFileId { get; set; } = null!;

    public string IncidenceReportId { get; set; } = null!;

    public virtual AttachedFile AttachedFile { get; set; } = null!;

    public virtual IncidenceReport IncidenceReport { get; set; } = null!;
}
