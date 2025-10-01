using SAPLSServer.DTOs.Concrete.ShiftDiaryDtos;
using SAPLSServer.DTOs.PaginationDto;

namespace SAPLSServer.Services.Interfaces
{
    /// <summary>
    /// Provides operations for managing shift diaries.
    /// </summary>
    public interface IShiftDiaryService
    {
        /// <summary>
        /// Creates a new shift diary entry.
        /// </summary>
        /// <param name="request">The shift diary creation request.</param>
        /// <param name="senderId">The ID of the staff creating the diary.</param>
        /// <returns>The created shift diary details.</returns>
        Task<ShiftDiaryDetailsDto> CreateAsync(CreateShiftDiaryRequest request, string senderId);

        /// <summary>
        /// Retrieves a list of shift diary summaries matching the specified filter.
        /// </summary>
        /// <param name="request">The filter criteria for retrieving shift diaries.</param>
        /// <returns>A list of shift diary summaries.</returns>
        Task<List<ShiftDiarySummaryDto>> GetListAsync(GetShiftDiaryListRequest request);

        /// <summary>
        /// Retrieves a paginated list of shift diary summaries matching the specified filter.
        /// </summary>
        /// <param name="pageRequest">Pagination information.</param>
        /// <param name="request">The filter criteria for retrieving shift diaries.</param>
        /// <returns>A paginated result of shift diary summaries.</returns>
        Task<PageResult<ShiftDiarySummaryDto>> GetPageAsync(PageRequest pageRequest, GetShiftDiaryListRequest request);

        /// <summary>
        /// Retrieves the details of a specific shift diary by its ID.
        /// </summary>
        /// <param name="id">The unique identifier of the shift diary.</param>
        /// <returns>The shift diary details, or null if not found.</returns>
        Task<ShiftDiaryDetailsDto?> GetDetailsAsync(string id);
    }
}