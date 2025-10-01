using System;
using System.Collections.Generic;

namespace SAPLSServer.Models;

public partial class AttachedFile
{
    public string Id { get; set; } = null!;

    public string CloudUrl { get; set; } = null!;

    public string CdnUrl { get; set; } = null!;

    public string OriginalFileName { get; set; } = null!;

    public string StorageFileName { get; set; } = null!;

    public long FileSize { get; set; }

    public string FileExtension { get; set; } = null!;

    public string FileHash { get; set; } = null!;

    public DateTime UploadAt { get; set; }

    public virtual IncidenceEvidence? IncidenceEvidence { get; set; }

    public virtual RequestAttachedFile? RequestAttachedFile { get; set; }
}
