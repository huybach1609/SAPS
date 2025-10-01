using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.RequestDtos;
using SAPLSServer.DTOs.Concrete.UserDtos;
using SAPLSServer.DTOs.Concrete.VehicleDtos;
using SAPLSServer.DTOs.PaginationDto;
using SAPLSServer.Exceptions;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using SAPLSServer.Services.Interfaces;
using System.Linq.Expressions;
using System.Text.Json;

namespace SAPLSServer.Services.Implementations
{
    public class RequestService : IRequestService
    {
        private readonly IRequestRepository _requestRepository;
        private readonly IClientService _clientService;
        private readonly IVehicleService _vehicleService;
        private readonly IFileService _fileService;
        private readonly IRequestAttachedFileService _requestAttachedFileService;

        public RequestService(
            IRequestRepository requestRepository,
            IClientService clientService,
            IVehicleService vehicleService,
            IFileService fileService,
            IRequestAttachedFileService requestAttachedFileService)
        {
            _requestRepository = requestRepository;
            _clientService = clientService;
            _vehicleService = vehicleService;
            _fileService = fileService;
            _requestAttachedFileService = requestAttachedFileService;
        }

        public async Task Create(CreateRequestRequest request, string senderId)
        {
            var entity = new Request
            {
                Id = Guid.NewGuid().ToString(),
                Header = request.Header,
                Description = request.Description,
                Status = RequestStatus.Open.ToString(),
                SubmittedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                SenderId = senderId,
                DataType = request.DataType,
                Data = request.Data
            };

            await _requestRepository.AddAsync(entity);
            await _requestRepository.SaveChangesAsync();

            // Handle file attachments if any
            if (request.Attachments != null && request.Attachments.Length > 0)
            {
                await ProcessAttachments(entity.Id, request.Attachments);
            }
        }

        public async Task<List<RequestSummaryDto>> GetList(GetRequestListByUserIdRequest request)
        {
            var criterias = BuildRequestCriterias(request);
            var sortBy = GetSortByExpression(request.SortBy);
            var ascending = IsAscending(request.Order);

            var requests = await _requestRepository.GetAllAsync(criterias.ToArray(), sortBy, ascending);
            var result = new List<RequestSummaryDto>();
            
            foreach (var requestItem in requests)
            {
                var requestWithDependencies = await _requestRepository.FindIncludingSenderReadOnly(requestItem.Id);
                if(requestWithDependencies != null)
                    result.Add(new RequestSummaryDto(requestWithDependencies));
            }
            
            return result;
        }

        public async Task<PageResult<RequestSummaryDto>> GetPage(PageRequest pageRequest, GetRequestListByUserIdRequest listRequest)
        {
            var criterias = BuildRequestCriterias(listRequest);
            var totalCount = await _requestRepository.CountAsync(criterias.ToArray());
            var sortBy = GetSortByExpression(listRequest.SortBy);
            var ascending = IsAscending(listRequest.Order);

            var page = await _requestRepository.GetPageAsync(
                pageRequest.PageNumber,
                pageRequest.PageSize,
                criterias.ToArray(),
                sortBy,
                ascending);

            var items = new List<RequestSummaryDto>();
            foreach (var requestItem in page)
            {
                var requestWithDependencies = await _requestRepository.FindIncludingSenderReadOnly(requestItem.Id);
                if (requestWithDependencies != null)
                    items.Add(new RequestSummaryDto(requestWithDependencies));
            }

            return new PageResult<RequestSummaryDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageRequest.PageNumber,
                PageSize = pageRequest.PageSize,
            };
        }

        public async Task UpdateRequestStatus(UpdateRequestRequest request, string adminId)
        {
            var entity = await _requestRepository.Find(request.Id);
            if (entity == null)
                throw new InvalidInformationException(MessageKeys.REQUEST_NOT_FOUND);

            entity.Status = request.Status;
            entity.InternalNote = request.InternalNote;
            entity.ResponseMessage = request.ResponseMessage;
            entity.UpdatedBy = adminId;
            entity.UpdatedAt = DateTime.UtcNow;

            // Process data updates if request is resolved
            if (request.Status == RequestStatus.Resolved.ToString() && 
                !string.IsNullOrEmpty(entity.DataType) && 
                !string.IsNullOrEmpty(entity.Data))
            {
                await ProcessResolvedRequestData(entity, adminId);
            }

            _requestRepository.Update(entity);
            await _requestRepository.SaveChangesAsync();
        }

        public async Task<RequestDetailsDto?> GetById(string requestId)
        {
            var request = await _requestRepository.FindIncludingSenderAndLastUpdaterReadOnly(requestId);
            if (request == null)
                return null;
            
            var attachments = await _requestAttachedFileService.GetAttachedFilesByRequestId(requestId);

            return new RequestDetailsDto(request, attachments?.ToArray());
        }

        private async Task ProcessResolvedRequestData(Request request, string adminId)
        {
            try
            {
                switch (request.DataType?.ToLower())
                {
                    case "clientprofile":
                        await ProcessClientProfileUpdate(request.Data!, adminId);
                        break;
                    case "vehicleinformation":
                        await ProcessVehicleUpdate(request.Data!, adminId);
                        break;
                    default:
                        // Log warning for unknown data type
                        request.InternalNote = $"{request.InternalNote}\nWarning: Unknown DataType '{request.DataType}'";
                        break;
                }
            }
            catch (Exception ex)
            {
                // Log error but don't fail the status update
                request.InternalNote = $"{request.InternalNote}\nData processing error: {ex.Message}";
            }
        }

        private async Task ProcessClientProfileUpdate(string clientData, string adminId)
        {
            var clientUpdateData = JsonSerializer.Deserialize<UpdateClientProfileRequest>(clientData);
            if (clientUpdateData?.Id != null)
            {
                await _clientService.Update(clientUpdateData, adminId);
            }
        }

        private async Task ProcessVehicleUpdate(string vehicleData, string adminId)
        {
            var vehicleUpdateData = JsonSerializer.Deserialize<UpdateVehicleRequest>(vehicleData);
            if (vehicleUpdateData?.Id != null)
            {
                await _vehicleService.Update(vehicleUpdateData, adminId);
            }
        }

        private async Task ProcessAttachments(string requestId, IFormFile[] attachments)
        {
            foreach (var attachment in attachments)
            {
                var uploadRequest = new DTOs.Concrete.FileUploadDtos.FileUploadRequest
                {
                    File = attachment,
                    Container = "request-attachments",
                    SubFolder = $"request-{requestId}",
                    GenerateUniqueFileName = true,
                    Metadata = new Dictionary<string, string>
                    {
                        { "RequestId", requestId },
                        { "AttachmentType", "RequestAttachment" }
                    }
                };

                var uploadResult = await _fileService.UploadFileAsync(uploadRequest);

                // Use the service to create and link the attached file
                await _requestAttachedFileService.AddAsync(requestId, uploadResult);
            }
        }

        private List<Expression<Func<Request, bool>>> BuildRequestCriterias(GetRequestListByUserIdRequest request)
        {
            var criterias = new List<Expression<Func<Request, bool>>>();

            if (!string.IsNullOrWhiteSpace(request.UserId))
                criterias.Add(r => r.SenderId == request.UserId);

            if (!string.IsNullOrWhiteSpace(request.Status))
                criterias.Add(r => r.Status == request.Status);

            if (request.StartDate.HasValue)
                criterias.Add(r => r.SubmittedAt.Date >= request.StartDate.Value.ToDateTime(TimeOnly.MinValue).Date);

            if (request.EndDate.HasValue)
                criterias.Add(r => r.SubmittedAt.Date <= request.EndDate.Value.ToDateTime(TimeOnly.MaxValue).Date);

            if (!string.IsNullOrWhiteSpace(request.SearchCriteria))
                criterias.Add(r => r.Header.Contains(request.SearchCriteria) || 
                                  r.Description.Contains(request.SearchCriteria));

            return criterias;
        }

        private Expression<Func<Request, object>> GetSortByExpression(string? sortBy)
        {
            if (string.IsNullOrWhiteSpace(sortBy))
                return r => r.SubmittedAt;

            switch (sortBy.Trim().ToLower())
            {
                case "submittedat":
                    return r => r.SubmittedAt;
                case "updatedat":
                    return r => r.UpdatedAt;
                case "status":
                    return r => r.Status;
                case "header":
                    return r => r.Header;
                default:
                    return r => r.SubmittedAt;
            }
        }

        private bool IsAscending(string? order)
        {
            return string.Equals(order, OrderType.Asc.ToString(), StringComparison.OrdinalIgnoreCase);
        }
    }
}