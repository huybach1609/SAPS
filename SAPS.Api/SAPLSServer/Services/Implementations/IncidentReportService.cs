using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using SAPLSServer.DTOs.Concrete.IncidenceReportDtos;
using SAPLSServer.DTOs.PaginationDto;
using SAPLSServer.Exceptions;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using SAPLSServer.Services.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Services.Implementations
{
    public class IncidentReportService : IIncidentReportService
    {
        private readonly IIncidenceReportRepository _incidentReportRepository;
        private readonly IStaffService _staffService;
        private readonly IFileService _fileService;
        private readonly IParkingLotOwnerService _parkingLotOwnerService;
        private readonly IParkingLotService _parkingLotService;
        private readonly IIncidenceEvidenceService _incidenceEvidenceService;

        public IncidentReportService(
            IIncidenceReportRepository incidentReportRepository,
            IStaffService staffService, 
            IFileService fileService,
            IParkingLotOwnerService parkingLotOwnerService,
            IParkingLotService parkingLotService,
            IIncidenceEvidenceService incidenceEvidenceService)
        {
            _incidentReportRepository = incidentReportRepository;
            _staffService = staffService;
            _fileService = fileService;
            _parkingLotOwnerService = parkingLotOwnerService;
            _parkingLotService = parkingLotService;
            _incidenceEvidenceService = incidenceEvidenceService;
        }

        public async Task CreateIncidentReport(CreateIncidentReportRequest request, string reporterId)
        {
            var reporter = await _staffService.FindByUserId(reporterId);
            if (reporter == null)
            {
                throw new InvalidInformationException(MessageKeys.STAFF_PROFILE_NOT_FOUND);
            }
            if (!await _parkingLotService.IsParkingLotValid(reporter.ParkingLotId))
            {
                throw new InvalidInformationException(MessageKeys.PARKING_LOT_NOT_FOUND);
            }
            var incidentReport = new IncidenceReport
            {
                Id = Guid.NewGuid().ToString(),
                Header = request.Header,
                Priority = request.Priority,
                Description = request.Description,
                Status = IncidentReportStatus.Open.ToString(),
                ReporterId = reporterId,
                ParkingLotId = reporter.ParkingLotId,
                ReportedDate = DateTime.UtcNow
            };

            await _incidentReportRepository.AddAsync(incidentReport);
            await _incidentReportRepository.SaveChangesAsync();

            // Handle file evidences if any
            if (request.Evidences != null && request.Evidences.Length > 0)
            {
                await ProcessEvidences(incidentReport.Id, request.Evidences);
            }
        }

        public async Task UpdateIncidentReportStatus(UpdateIncidentReportStatusRequest request, string performerId)
        {
            var parkingLotOwner = await _parkingLotOwnerService.IsParkingLotOwnerValid(performerId);
            if (!parkingLotOwner)
                throw new InvalidInformationException(MessageKeys.PARKING_LOT_OWNER_PROFILE_NOT_FOUND);
            var incidentReport = await _incidentReportRepository.Find(request.Id) 
                ?? throw new InvalidInformationException(MessageKeys.INCIDENT_REPORT_NOT_FOUND);
            // Only the owner of the parking lot can update the status
            if (!await _parkingLotService.IsParkingLotOwner(incidentReport.ParkingLotId, performerId))
                throw new UnauthorizedAccessException(MessageKeys.UNAUTHORIZED_ACCESS);

            incidentReport.Status = request.Status;
            _incidentReportRepository.Update(incidentReport);
            await _incidentReportRepository.SaveChangesAsync();
        }

        public async Task<IncidentReportDetailsDto?> GetIncidentReportDetails(GetDetailsRequest request)
        {
            var incidentReport = await _incidentReportRepository.FindIncludeSenderInformationReadOnly(request.Id);
            if (incidentReport == null)
                return null;

            // Get the attached files for this incident report
            var attachments = await _incidenceEvidenceService.GetAttachedFilesByIncidentReportId(incidentReport.Id);

            // Pass the attachments to the DTO
            return new IncidentReportDetailsDto(incidentReport, attachments?.ToArray());
        }

        public async Task<PageResult<IncidentReportSummaryDto>> GetIncidentReportsPage(PageRequest pageRequest, GetIncidenReportListRequest listRequest)
        {
            // Build filter criteria based on the listRequest parameters
            var criterias = BuildIncidentReportCriterias(listRequest);
            var sortBy = GetSortByExpression(listRequest.SortBy);
            var isAscending = IsAscending(listRequest.Order);

            // Get total count for pagination
            var totalCount = await _incidentReportRepository.CountAsync(criterias.ToArray());

            // Get paginated results
            var incidentReports = await _incidentReportRepository.GetPageAsync(
                pageRequest.PageNumber,
                pageRequest.PageSize,
                criterias.ToArray(),
                sortBy,
                isAscending);

            // Convert to DTOs
            var items = incidentReports.Select(ir => new IncidentReportSummaryDto(ir)).ToList();

            return new PageResult<IncidentReportSummaryDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageRequest.PageNumber,
                PageSize = pageRequest.PageSize
            };
        }

        public async Task<List<IncidentReportSummaryDto>> GetIncidentReportsList(GetIncidenReportListRequest request)
        {
            // Build filter criteria based on the listRequest parameters
            var criterias = BuildIncidentReportCriterias(request);
            var sortBy = GetSortByExpression(request.SortBy);
            var isAscending = IsAscending(request.Order);

            // Get all results (no pagination)
            var incidentReports = await _incidentReportRepository.GetAllAsync(
                criterias.ToArray(),
                sortBy,
                isAscending);

            // Convert to DTOs
            return incidentReports.Select(ir => new IncidentReportSummaryDto(ir)).ToList();
        }

        #region Private Helper Methods

        private static List<Expression<Func<IncidenceReport, bool>>> BuildIncidentReportCriterias(GetIncidenReportListRequest? request)
        {
            var criterias = new List<Expression<Func<IncidenceReport, bool>>>();

            // Handle null request
            if (request == null)
                return criterias;

            // Filter by parking lot (required field)
            if (!string.IsNullOrWhiteSpace(request.ParkingLotId))
            {
                criterias.Add(ir => ir.ParkingLotId == request.ParkingLotId);
            }

            // Filter by priority
            if (!string.IsNullOrWhiteSpace(request.Priority))
            {
                criterias.Add(ir => ir.Priority == request.Priority);
            }

            // Filter by status
            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                criterias.Add(ir => ir.Status == request.Status);
            }

            // Filter by date range
            if (request.StartDate.HasValue)
            {
                var startDateTime = request.StartDate.Value.ToDateTime(TimeOnly.MinValue);
                criterias.Add(ir => ir.ReportedDate >= startDateTime);
            }

            if (request.EndDate.HasValue)
            {
                var endDateTime = request.EndDate.Value.ToDateTime(TimeOnly.MaxValue);
                criterias.Add(ir => ir.ReportedDate <= endDateTime);
            }

            // Filter by search criteria (search in header and description)
            if (!string.IsNullOrWhiteSpace(request.SearchCriteria))
            {
                criterias.Add(ir => ir.Header.Contains(request.SearchCriteria) ||
                                   ir.Description.Contains(request.SearchCriteria));
            }

            return criterias;
        }

        private static Expression<Func<IncidenceReport, object>> GetSortByExpression(string? sortBy)
        {
            if (string.IsNullOrWhiteSpace(sortBy))
                return ir => ir.ReportedDate;

            switch (sortBy.Trim().ToLower())
            {
                case "reporteddate":
                    return ir => ir.ReportedDate;
                case "header":
                    return ir => ir.Header;
                case "priority":
                    return ir => ir.Priority;
                case "status":
                    return ir => ir.Status;
                case "description":
                    return ir => ir.Description;
                default:
                    return ir => ir.ReportedDate;
            }
        }

        private static bool IsAscending(string? order)
        {
            return string.Equals(order, OrderType.Asc.ToString(), StringComparison.OrdinalIgnoreCase);
        }

        #endregion

        private async Task ProcessEvidences(string incidentReportId, IFormFile[] evidences)
        {
            foreach (var evidence in evidences)
            {
                var uploadRequest = new DTOs.Concrete.FileUploadDtos.FileUploadRequest
                {
                    File = evidence,
                    Container = "incident-evidences",
                    SubFolder = $"incident-{incidentReportId}",
                    GenerateUniqueFileName = true,
                    Metadata = new Dictionary<string, string>
                    {
                        { "IncidentReportId", incidentReportId },
                        { "AttachmentType", "IncidentEvidence" }
                    }
                };

                var uploadResult = await _fileService.UploadFileAsync(uploadRequest);

                // Use the service to create and link the attached file
                await _incidenceEvidenceService.AddAsync(incidentReportId, uploadResult);
            }
        }
    }
}