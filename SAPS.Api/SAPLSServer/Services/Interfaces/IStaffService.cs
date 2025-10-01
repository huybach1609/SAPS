using SAPLSServer.DTOs.Concrete;
using SAPLSServer.DTOs.Concrete.UserDtos;
using SAPLSServer.DTOs.PaginationDto;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SAPLSServer.Services.Interfaces
{
    /// <summary>
    /// Provides comprehensive operations for managing staff profiles and assignments, including creation, updates, 
    /// retrieval, validation, parking lot associations, and shift management.
    /// </summary>
    public interface IStaffService
    {
        /// <summary>
        /// Creates a new staff profile.
        /// </summary>
        /// <param name="request">The request containing staff profile details.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task Create(CreateStaffProfileRequest request);

        /// <summary>
        /// Updates an existing staff profile.
        /// </summary>
        /// <param name="request">The request containing updated staff profile details.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task Update(UpdateStaffProfileRequest request);

        /// <summary>
        /// Retrieves detailed information about a staff member by their staff identifier.
        /// </summary>
        /// <param name="staffId">The unique identifier of the staff member.</param>
        /// <returns>A task that returns the staff member's detailed information, or null if not found.</returns>
        Task<StaffProfileDetailsDto?> FindByStaffId(string staffId);

        /// <summary>
        /// Retrieves detailed information about a staff member by their user identifier.
        /// </summary>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <returns>A task that returns the staff member's detailed information, or null if not found.</returns>
        Task<StaffProfileDetailsDto?> FindByUserId(string userId);

        /// <summary>
        /// Retrieves a paginated list of staff profiles with optional search criteria.
        /// </summary>
        /// <param name="pageRequest">The pagination request containing page number and size.</param>
        /// <param name="request">The optional search criteria for filtering staff profiles.</param>
        /// <returns>A paginated result of staff profile summaries.</returns>
        Task<PageResult<StaffProfileSummaryDto>> GetStaffProfilesPage(PageRequest pageRequest, GetStaffListRequest request);

        /// <summary>
        /// Retrieves a list of staff profiles with optional search criteria.
        /// </summary>
        /// <param name="request">The optional search criteria for filtering staff profiles.</param>
        /// <returns>A task that returns a list of staff profile summaries.</returns>
        Task<List<StaffProfileSummaryDto>> GetStaffProfiles(GetStaffListRequest request);

        /// <summary>
        /// Retrieves the parking lot ID associated with a staff member by their user ID or staff ID.
        /// </summary>
        /// <param name="userIdOrstaffId">The user ID or staff ID to identify the staff member.</param>
        /// <returns>A task that returns the parking lot ID associated with the staff member.</returns>
        Task<string> GetParkingLotId(string userIdOrstaffId);

        /// <summary>
        /// Checks if the specified user is a valid staff member.
        /// </summary>
        /// <param name="userId">The user ID to check.</param>
        /// <returns>True if the user is a valid staff member; otherwise, false.</returns>
        Task<bool> IsStaffValid(string userId);
        Task<bool> IsStaffInCurrentShift(string userId);
    }
}