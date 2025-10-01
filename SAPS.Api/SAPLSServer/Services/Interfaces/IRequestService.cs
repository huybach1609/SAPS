using SAPLSServer.DTOs.Concrete.RequestDtos;
using SAPLSServer.DTOs.PaginationDto;

namespace SAPLSServer.Services.Interfaces
{
    /// <summary>
    /// Provides operations for managing requests, including creation, retrieval, status updates, and data processing.
    /// </summary>
    public interface IRequestService
    {
        /// <summary>
        /// Creates a new request with the provided details.
        /// </summary>
        /// <param name="request">The request containing request creation details.</param>
        /// <param name="senderId">The unique identifier of the user submitting the request.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task Create(CreateRequestRequest request, string senderId);

        /// <summary>
        /// Retrieves a list of requests based on the specified criteria.
        /// </summary>
        /// <param name="request">The request containing filter criteria.</param>
        /// <returns>List of request summaries.</returns>
        Task<List<RequestSummaryDto>> GetList(GetRequestListByUserIdRequest request);

        /// <summary>
        /// Retrieves a paginated list of requests based on the specified criteria.
        /// </summary>
        /// <param name="pageRequest">Pagination information (page number and size).</param>
        /// <param name="listRequest">The filter criteria for requests.</param>
        /// <returns>A paginated result containing request summaries.</returns>
        Task<PageResult<RequestSummaryDto>> GetPage(PageRequest pageRequest, GetRequestListByUserIdRequest listRequest);

        /// <summary>
        /// Updates the status of a request and processes associated data if resolved.
        /// When status is "Resolved" and DataType/Data are provided, performs updates on Client or Vehicle entities.
        /// </summary>
        /// <param name="request">The request containing status update details.</param>
        /// <param name="adminId">The unique identifier of the admin performing the update.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task UpdateRequestStatus(UpdateRequestRequest request, string adminId);

        /// <summary>
        /// Retrieves detailed information about a request by its unique identifier.
        /// </summary>
        /// <param name="requestId">The unique identifier of the request.</param>
        /// <returns>The request details, or null if not found.</returns>
        Task<RequestDetailsDto?> GetById(string requestId);
    }
}