using SAPLDesktopApp.DTOs.Concrete.IncidenceReportDtos;
using SAPLSServer.DTOs.PaginationDto;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    public interface IIncidenceReportService : IDisposable
    {
        Task<IncidentReportDetailsDto> CreateIncidentReportAsync(CreateIncidentReportRequest request);
        Task<PageResult<IncidentReportSummaryDto>> GetIncidentReportPageAsync(PageRequest pageRequest, 
            GetIncidenReportListRequest request);
        Task<List<IncidentReportSummaryDto>> GetIncidentReportListAsync(GetIncidenReportListRequest request);
        Task<IncidentReportDetailsDto> GetIncidentReportDetailsAsync(string incidentReportId);
    }
}