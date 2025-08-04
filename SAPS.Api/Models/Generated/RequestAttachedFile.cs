using System;
using System.Collections.Generic;

namespace SAPS.Api.Models.Generated;

public partial class RequestAttachedFile
{
    public string Id { get; set; } = null!;

    public string FileName { get; set; } = null!;

    public DateTime UploadAt { get; set; }

    public string RequestId { get; set; } = null!;

    public virtual Request Request { get; set; } = null!;
}
