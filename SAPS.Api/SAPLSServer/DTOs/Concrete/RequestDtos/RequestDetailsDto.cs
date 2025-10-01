using SAPLSServer.DTOs.Base;
using SAPLSServer.Models;
using SAPLSServer.DTOs.Concrete.AttachedFileDtos;

namespace SAPLSServer.DTOs.Concrete.RequestDtos
{
    public class RequestDetailsDto : RequestSummaryDto
    {
        public string SenderEmail { get; set; }
        public string Description { get; set; }
        public string? InternalNote { get; set; }
        public string? ResponseMessage { get; set; }
        public string? LastUpdateAdminId { get; set; }
        public string? LastUpdateAdminFullName { get; set; }
        public GetAttachedFileDto[]? Attachments { get; set; }

        public RequestDetailsDto(Request request, GetAttachedFileDto[]? attachments = null) : base(request)
        {
            SenderEmail = request.Sender?.Email ?? string.Empty;
            Description = request.Description;
            InternalNote = request.InternalNote;
            ResponseMessage = request.ResponseMessage;
            LastUpdateAdminId = request.UpdatedByNavigation?.AdminId;
            LastUpdateAdminFullName = request.UpdatedByNavigation?.User.FullName;
            Attachments = attachments?.ToArray();
        }
    }
}
