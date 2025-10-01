using SAPLSServer.DTOs.Concrete.SubscriptionDtos;
using SAPLSServer.DTOs.PaginationDto;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SAPLSServer.Services.Interfaces
{
    public interface ISubscriptionService
    {
        /// <summary>
        /// Retrieves a filtered list of subscriptions based on the provided criteria.
        /// </summary>
        /// <param name="request">The filter and search criteria for subscriptions.</param>
        /// <returns>A list of subscription summaries.</returns>
        Task<List<SubscriptionSummaryDto>> GetListAsync(GetSubscriptionListRequest request);

        /// <summary>
        /// Retrieves a paginated and filtered list of subscriptions.
        /// </summary>
        /// <param name="pageRequest">Pagination information (page number and size).</param>
        /// <param name="request">The filter and search criteria for subscriptions.</param>
        /// <returns>A paginated result containing subscription summaries.</returns>
        Task<PageResult<SubscriptionSummaryDto>> GetPageAsync(PageRequest pageRequest, GetSubscriptionListRequest request);

        /// <summary>
        /// Retrieves the details of a specific subscription by its unique identifier.
        /// </summary>
        /// <param name="id">The unique identifier of the subscription.</param>
        /// <returns>The subscription details, or null if not found.</returns>
        Task<SubscriptionDetailsDto?> GetDetailsAsync(string id);

        /// <summary>
        /// Creates a new subscription with the provided information.
        /// </summary>
        /// <param name="request">The subscription creation data.</param>
        /// <param name="adminId">The ID of the admin performing the operation.</param>
        Task CreateAsync(CreateSubscriptionRequest request, string adminId);
        Task UpdateAsync(UpdateSubscriptionRequest request, string adminId);
        /// <summary>
        /// Updates the status of an existing subscription.
        /// </summary>
        /// <param name="request">The request containing the subscription ID and new status.</param>
        /// <param name="adminId">The ID of the admin performing the update.</param>
        Task UpdateStatusAsync(UpdateSubscriptionStatusRequest request, string adminId);
        /// <summary>
        /// Retrieves the duration (in days, months, or other unit as defined) of a specific subscription by its unique identifier.
        /// </summary>
        /// <param name="subscriptionId">The unique identifier of the subscription.</param>
        /// <returns>The duration value of the subscription.</returns>
        Task<long> GetDurationOfSubscription(string subscriptionId);
        Task<double> GetCostOfSubscription(string subscriptionId);
    }
}