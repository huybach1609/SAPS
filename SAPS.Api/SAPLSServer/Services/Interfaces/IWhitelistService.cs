using SAPLSServer.DTOs.Concrete.WhiteListDtos;
using SAPLSServer.DTOs.PaginationDto;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SAPLSServer.Services.Interfaces
{
    /// <summary>
    /// Provides operations for managing parking lot whitelists.
    /// </summary>
    public interface IWhiteListService
    {
        /// <summary>
        /// Checks if a client is in the whitelist of a specific parking lot.
        /// </summary>
        /// <param name="parkingLotId">The parking lot ID.</param>
        /// <param name="clientId">The client ID.</param>
        /// <returns>True if the client is whitelisted, otherwise false.</returns>
        Task<bool> IsClientWhitelistedAsync(string parkingLotId, string clientId);

        /// <summary>
        /// Adds a client to the whitelist of a parking lot.
        /// </summary>
        /// <param name="request">The request containing parking lot and client information.</param>
        /// <param name="parkingLotOwnerId">The parking lot owner's ID.</param>
        Task AddToWhiteListAsync(AddAttendantToWhiteListRequest request, string parkingLotOwnerId);
        /// <summary>
        /// Updates the expiration date of a whitelist entry.
        /// </summary>
        /// <param name="request">The request containing the update information.</param>
        /// <param name="parkingLotOwnerId">The parking lot owner's ID.</param>
        Task UpdateExpireAtAsync(UpdateWhiteListAttendantExpireDateRequest request, string parkingLotOwnerId);

        /// <summary>
        /// Removes a client from the whitelist of a parking lot.
        /// </summary>
        /// <param name="request">The request containing parking lot and client information.</param>
        /// <param name="parkingLotOwnerId">The parking lot owner's ID.</param>
        Task RemoveFromWhiteListAsync(RemoveAttendantFromWhiteListRequest request, string parkingLotOwnerId);

        /// <summary>
        /// Gets a list of whitelisted attendants for a parking lot.
        /// </summary>
        /// <param name="request">The request containing filter criteria.</param>
        /// <returns>List of whitelist attendants.</returns>
        Task<List<WhiteListAttendantDto>> GetWhiteListAsync(GetWhiteListAttendantListRequest request);

        /// <summary>
        /// Gets a paginated list of whitelisted attendants for a parking lot.
        /// </summary>
        /// <param name="pageRequest">Pagination information.</param>
        /// <param name="request">The request containing filter criteria.</param>
        /// <returns>Paginated result of whitelist attendants.</returns>
        Task<PageResult<WhiteListAttendantDto>> GetWhiteListPageAsync(PageRequest pageRequest, GetWhiteListAttendantListRequest request);
    }
}