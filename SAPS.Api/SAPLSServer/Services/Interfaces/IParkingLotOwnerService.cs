using SAPLSServer.DTOs.Base;
using SAPLSServer.DTOs.Concrete.UserDtos;
using SAPLSServer.DTOs.PaginationDto;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SAPLSServer.Services.Interfaces
{
    /// <summary>
    /// Provides operations for managing parking lot owner profiles, including creation, updates, retrieval, and validation.
    /// </summary>
    public interface IParkingLotOwnerService
    {
        /// <summary>
        /// Creates a new parking lot owner profile.
        /// </summary>
        /// <param name="request">The request containing parking lot owner profile details.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task Create(CreateParkingLotOwnerProfileRequest request, string createPerformerId);

        /// <summary>
        /// Updates an existing parking lot owner profile.
        /// </summary>
        /// <param name="request">The request containing updated parking lot owner profile details.</param>
        /// <param name="updatePerformerId">The user ID of the admin performing the update.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task Update(UpdateParkingLotOwnerProfileRequest request, string updatePerformerId);

        /// <summary>
        /// Retrieves detailed information about a parking lot owner by their owner identifier.
        /// </summary>
        /// <param name="ownerId">The unique identifier of the parking lot owner.</param>
        /// <returns>A task that returns the owner's detailed information, or null if not found.</returns>
        Task<ParkingLotOwnerProfileDetailsDto?> GetByParkingLotOwnerId(string ownerId);

        /// <summary>
        /// Retrieves detailed information about a parking lot owner by their user identifier.
        /// </summary>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <returns>A task that returns the owner's detailed information, or null if not found.</returns>
        Task<ParkingLotOwnerProfileDetailsDto?> GetByUserId(string userId);

        /// <summary>
        /// Retrieves a paginated list of parking lot owner profiles with optional search criteria.
        /// </summary>
        /// <param name="pageRequest">The pagination request containing page number and size.</param>
        /// <param name="request">The search/filter criteria for parking lot owner profiles.</param>
        /// <returns>A paginated result of parking lot owner profile summaries.</returns>
        Task<PageResult<ParkingLotOwnerProfileSummaryDto>> GetParkingLotOwnerProfilesPage(PageRequest pageRequest, GetParkingLotOwnerListRequest request);

        /// <summary>
        /// Retrieves a list of parking lot owner profiles with optional search criteria.
        /// </summary>
        /// <param name="request">The search/filter criteria for parking lot owner profiles.</param>
        /// <returns>A task that returns a list of parking lot owner profile summaries.</returns>
        Task<List<ParkingLotOwnerProfileSummaryDto>> GetParkingLotOwnerProfiles(GetParkingLotOwnerListRequest request);

        /// <summary>
        /// Checks if the specified user is a valid parking lot owner.
        /// </summary>
        /// <param name="userId">The user ID to check.</param>
        /// <returns>True if the user is a valid parking lot owner; otherwise, false.</returns>
        Task<bool> IsParkingLotOwnerValid(string userId);
    }
}