using System;
using System.Collections.Generic;

namespace SAPLSServer.Models;

public partial class RequestAttachedFile
{
    public string AttachedFileId { get; set; } = null!;

    public string RequestId { get; set; } = null!;

    public virtual AttachedFile AttachedFile { get; set; } = null!;

    public virtual Request Request { get; set; } = null!;
}
