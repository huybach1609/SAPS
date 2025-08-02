using System;
using System.Collections.Generic;

namespace SAPS.Api.Models.Generated;

public partial class Request
{
    public string Id { get; set; } = null!;

    public string Header { get; set; } = null!;

    public string Description { get; set; } = null!;

    public string Status { get; set; } = null!;

    public DateTime SubmittedDate { get; set; }

    public DateTime LastUpdatedDate { get; set; }

    public string? InternalNote { get; set; }

    public string? ResponseMessage { get; set; }

    public string SenderId { get; set; } = null!;

    public string LastUpdatePersonId { get; set; } = null!;

    public virtual ICollection<RequestAttachedFile> RequestAttachedFiles { get; set; } = new List<RequestAttachedFile>();

    public virtual User Sender { get; set; } = null!;
}
