using SAPLSServer.DTOs.Base;
using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.RequestDtos
{
    public class RequestSummaryDto : GetResult
    {
        public string Header { get; set; }

        public string Status { get; set; }

        public DateTime SubmittedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
        public string SenderId { get; set; }
        public string SenderFullName { get; set; }
        public RequestSummaryDto(Request request)
        {
            Id = request.Id;
            Header = request.Header;
            Status = request.Status;
            SubmittedAt = request.SubmittedAt;
            UpdatedAt = request.UpdatedAt;
            SenderId = request.SenderId ?? string.Empty;
            SenderFullName = request.Sender?.FullName ?? string.Empty;
        }
    }
}
