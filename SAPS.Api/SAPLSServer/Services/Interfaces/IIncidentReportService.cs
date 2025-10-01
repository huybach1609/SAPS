using SAPLSServer.DTOs.Base;
using SAPLSServer.DTOs.Concrete.IncidenceReportDtos;
using SAPLSServer.DTOs.PaginationDto;

namespace SAPLSServer.Services.Interfaces
{
    public interface IIncidentReportService
    {
        /// <summary>
        /// Creates a new incident report with the provided details.
        /// </summary>
        /// <param name="request"></param>
        /// <param name="reporterId"></param>
        /// <returns></returns>
        Task CreateIncidentReport(CreateIncidentReportRequest request, string reporterId);

        /// <summary>
        /// Updates the status of an existing incident report.
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        Task UpdateIncidentReportStatus(UpdateIncidentReportStatusRequest request, string performerId);

        /// <summary>
        /// Retrieves the details of an incident report by its unique identifier (ID).
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        Task<IncidentReportDetailsDto?> GetIncidentReportDetails(GetDetailsRequest request);

        /// <summary>
        /// Retrieves a list of incident reports with optional filtering criteria.
        /// Supports filtering by parking lot, staff, priority, status, date range, and search criteria.
        /// </summary>
        /// <param name="request">The filter criteria for incident reports.</param>
        /// <returns>A list of incident report summaries.</returns>
        Task<List<IncidentReportSummaryDto>> GetIncidentReportsList(GetIncidenReportListRequest request);
        Task<PageResult<IncidentReportSummaryDto>> GetIncidentReportsPage(PageRequest pageRequest, GetIncidenReportListRequest listRequest);
    }
}