using SAPLSServer.DTOs.Concrete.UserDtos;
using SAPLSServer.DTOs.PaginationDto;

namespace SAPLSServer.Services.Interfaces
{
    /// <summary>
    /// Provides operations for managing client profiles.
    /// </summary>
    public interface IClientService
    {
        /// <summary>
        /// Creates a new client profile.
        /// </summary>
        /// <param name="request">The request containing client profile details.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task Create(CreateClientProfileRequest request);

        /// <summary>
        /// Updates an existing client profile.
        /// </summary>
        /// <param name="request">The request containing updated client profile details.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task Update(UpdateClientProfileRequest request, string updatePerformerId);

        /// <summary>
        /// Retrieves detailed information about a client by their citizen ID number.
        /// </summary>
        /// <param name="citizenIdNo">The citizen ID number of the client.</param>
        /// <returns>A task that returns the client's detailed information.</returns>
        Task<ClientProfileDetailsDto?> GetByCitizenIdNo(string citizenIdNo);

        /// <summary>
        /// Retrieves detailed information about a client by their user identifier.
        /// </summary>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <returns>A task that returns the client's detailed information.</returns>
        Task<ClientProfileDetailsDto?> GetByUserId(string userId);

        /// <summary>
        /// Retrieves a paginated list of client profiles with optional search criteria.
        /// </summary>
        /// <param name="pageRequest">The pagination request containing page number and size.</param>
        /// <param name="request">The search/filter criteria for client profiles.</param>
        /// <returns>A paginated result of client profile details.</returns>
        Task<PageResult<ClientProfileSummaryDto>> GetClientProfilesPage(PageRequest pageRequest, GetClientListRequest request);

        /// <summary>
        /// Retrieves a summary of client profiles by their vehicle share code.
        /// </summary>
        /// <param name="shareCode">The unique share code associated with the client.</param>
        /// <returns>A task that returns the client profile summary associated with the share code.</returns>
        Task<ClientProfileSummaryDto> GetUserIdByShareCode(string shareCode);

        /// <summary>
        /// Updates the device token for a client profile.
        /// </summary>
        /// <param name="userId">The user ID of the client.</param>
        /// <param name="deviceToken">The FCM device token to register, or null to clear.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task UpdateDeviceToken(string userId, string? deviceToken);

        /// <summary>
        /// Retrieves the device token for a client profile.
        /// </summary>
        /// <param name="userId">The user ID of the client.</param>
        /// <returns>A task that returns the device token, or null if not found.</returns>
        Task<string?> GetDeviceToken(string userId);
        Task<bool> IsClientValid(string userId);
        /// <summary>
        /// Verifies and updates the client profile with level two verification data, including citizen card images and personal information.
        /// </summary>
        /// <param name="request">The request containing all required verification data and images.</param>
        /// <param name="performerId">The user ID performing the verification (should match the client).</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task VerifyLevelTwo(VerifyLevelTwoClientRequest request, string performerId);

        /// <summary>
        /// Checks if the client profile has completed level two verification.
        /// </summary>
        /// <param name="userId">The user ID of the client.</param>
        /// <returns>A task that returns true if the client is verified at level two, otherwise false.</returns>
        Task<bool> IsVerifyLevelTwo(string userId);
        Task<List<ClientProfileSummaryDto>> GetClientProfiles(GetClientListRequest request);
    }
}