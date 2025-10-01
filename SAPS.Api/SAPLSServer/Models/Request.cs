using System;
using System.Collections.Generic;

namespace SAPLSServer.Models;

public partial class Request
{
    public string Id { get; set; } = null!;

    public string Header { get; set; } = null!;

    public string Description { get; set; } = null!;

    public string Status { get; set; } = null!;

    public DateTime SubmittedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string? InternalNote { get; set; }

    public string? ResponseMessage { get; set; }

    public string? UpdatedBy { get; set; }

    public string? DataType { get; set; }

    public string? Data { get; set; }

    public string? SenderId { get; set; }

    public virtual ICollection<RequestAttachedFile> RequestAttachedFiles { get; set; } = new List<RequestAttachedFile>();

    public virtual User? Sender { get; set; }

    public virtual AdminProfile? UpdatedByNavigation { get; set; }
}
