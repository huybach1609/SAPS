using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.UserDtos;
using SAPLSServer.DTOs.PaginationDto;

namespace SAPLSServer.Services.Interfaces
{
    /// <summary>
    /// Provides operations for managing admin profiles.
    /// </summary>
    public interface IAdminService
    {
        /// <summary>
        /// Creates a new admin profile.
        /// </summary>
        /// <param name="request">The request containing admin profile details.</param>
        /// <param name="performedByAdminUserId">The user ID of the admin performing the operation.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task Create(CreateAdminProfileRequest request, string performedByAdminUserId);

        /// <summary>
        /// Updates an existing admin profile.
        /// </summary>
        /// <param name="request">The request containing updated admin profile details.</param>
        /// <param name="performedByAdminUserId">The user ID of the admin performing the operation.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task Update(UpdateAdminProfileRequest request, string performedByAdminUserId);

        /// <summary>
        /// Retrieves detailed information about an admin by their unique admin identifier.
        /// </summary>
        /// <param name="adminId">The unique identifier of the admin.</param>
        /// <returns>A task that returns the admin's detailed information.</returns>
        Task<AdminProfileDetailsDto?> GetByAdminIdAsync(string adminId);

        /// <summary>
        /// Retrieves detailed information about an admin by their user identifier.
        /// </summary>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <returns>A task that returns the admin's detailed information.</returns>
        Task<AdminProfileDetailsDto?> GetByUserIdAsync(string userId);

        /// <summary>
        /// Retrieves a paginated list of admin profiles with optional search criteria.
        /// </summary>
        /// <param name="pageRequest">The pagination request containing page number and size.</param>
        /// <param name="request">The search/filter criteria for admin profiles.</param>
        /// <returns>A paginated result of admin profile details.</returns>
        Task<PageResult<AdminProfileSummaryDto>> GetAdminProfilesPage(PageRequest pageRequest, GetAdminListRequest request);

        /// <summary>
        /// Retrieves a list of admin profiles with optional search criteria.
        /// </summary>
        /// <param name="request">The search/filter criteria for admin profiles.</param>
        /// <returns>A task that returns a list of admin profile summaries.</returns>
        Task<List<AdminProfileSummaryDto>> GetAdminProfiles(GetAdminListRequest request);

        /// <summary>
        /// Retrieves the role of an admin by their user ID or admin ID.
        /// </summary>
        /// <param name="userIdOrAdminId">The user ID or admin ID to identify the admin.</param>
        /// <returns>A task that returns the admin's role.</returns>
        Task<AdminRole> GetAdminRole(string userIdOrAdminId);

        /// <summary>
        /// Checks if the specified user is a valid admin.
        /// </summary>
        /// <param name="userIdOrAdminId">The user ID or admin ID to check.</param>
        /// <returns>True if the user is an admin, otherwise false.</returns>
        Task<bool> IsAdminValid(string userIdOrAdminId);

        /// <summary>
        /// Checks if the specified user is a valid head admin.
        /// </summary>
        /// <param name="userIdOrAdminId">The user ID or admin ID to check.</param>
        /// <returns>True if the user is a head admin, otherwise false.</returns>
        Task<bool> IsHeadAdminValid(string userIdOrAdminId);
    }
}