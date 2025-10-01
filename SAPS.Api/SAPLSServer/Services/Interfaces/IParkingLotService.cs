using SAPLSServer.DTOs.Base;
using SAPLSServer.DTOs.Concrete.ParkingLotDtos;
using SAPLSServer.DTOs.Concrete.PaymentDtos;
using SAPLSServer.DTOs.Concrete.SubscriptionDtos;
using SAPLSServer.DTOs.PaginationDto;

namespace SAPLSServer.Services.Interfaces
{
    /// <summary>
    /// Provides operations for managing parking lots, including creation, updates, retrieval, paging, and ownership checks.
    /// </summary>
    public interface IParkingLotService
    {
        /// <summary>
        /// Creates a new parking lot with the specified details.
        /// </summary>
        /// <param name="dto">The request containing parking lot creation details.</param>
        /// <param name="performerAdminId">The unique identifier of the admin performing the creation.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task CreateParkingLot(CreateParkingLotRequest request, string performerAdminId);

        /// <summary>
        /// Updates the basic information of an existing parking lot.
        /// </summary>
        /// <param name="request">The request containing updated parking lot information.</param>
        /// <param name="performerId">The unique identifier of the user performing the update.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task UpdateParkingLotBasicInformation(UpdateParkingLotBasicInformationRequest request, string performerId);

        /// <summary>
        /// Updates the address of an existing parking lot.
        /// </summary>
        /// <param name="request">The request containing the new address.</param>
        /// <param name="performerAdminId">The unique identifier of the admin performing the update.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task UpdateParkingLotAddress(UpdateParkingLotAddressRequest request, string performerAdminId);

        /// <summary>
        /// Retrieves the details of a parking lot by its unique identifier.
        /// </summary>
        /// <param name="parkingLotId">The unique identifier of the parking lot.</param>
        /// <returns>The parking lot details, or null if not found.</returns>
        Task<ParkingLotDetailsDto?> GetParkingLotDetails(string parkingLotId);
        Task<ParkingLotDetailsForOwner?> GetParkingLotDetailsForOwner(string parkingLotId);

        /// <summary>
        /// Retrieves a paginated list of parking lots based on the provided page request and filter criteria.
        /// </summary>
        /// <param name="pageRequest">Pagination information (page number and size).</param>
        /// <param name="request">The filter and search criteria for parking lots.</param>
        /// <returns>A paginated result containing parking lot summaries.</returns>
        Task<PageResult<ParkingLotSummaryDto>> GetParkingLotsPage(PageRequest pageRequest, GetParkingLotListRequest request);

        /// <summary>
        /// Retrieves a list of parking lots based on the provided filter criteria.
        /// </summary>
        /// <param name="request">The filter and search criteria for parking lots.</param>
        /// <returns>A list of parking lot summaries.</returns>
        Task<List<ParkingLotSummaryDto>> GetParkingLots(GetParkingLotListRequest request);

        /// <summary>
        /// Deletes a parking lot by its unique identifier.
        /// </summary>
        /// <param name="request">The request containing the parking lot ID to delete.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task DeleteParkingLot(DeleteRequest request);

        /// <summary>
        /// Checks if the specified user is the owner of the given parking lot.
        /// </summary>
        /// <param name="parkingLotId">The unique identifier of the parking lot.</param>
        /// <param name="userId">The user ID to check for ownership.</param>
        /// <returns>True if the user is the owner, otherwise false.</returns>
        Task<bool> IsParkingLotOwner(string parkingLotId, string userId);

        /// <summary>
        /// Checks if the specified parking lot is expired.
        /// </summary>
        /// <param name="parkingLotId">The unique identifier of the parking lot.</param>
        /// <returns>True if the parking lot is expired, otherwise false.</returns>
        Task<bool> IsParkingLotExpired(string parkingLotId);

        /// <summary>
        /// Checks if the specified parking lot is valid (not expired and meets all requirements).
        /// </summary>
        /// <param name="parkingLotId">The unique identifier of the parking lot.</param>
        /// <returns>True if the parking lot is valid, otherwise false.</returns>
        Task<bool> IsParkingLotValid(string parkingLotId);

        /// <summary>
        /// Checks if the specified user is a staff member of the given parking lot.
        /// </summary>
        /// <param name="parkingLotId">The unique identifier of the parking lot.</param>
        /// <param name="userId">The user ID to check for staff membership.</param>
        /// <returns>True if the user is a staff member, otherwise false.</returns>
        Task<bool> IsParkingLotStaff(string parkingLotId, string userId);

        /// <summary>
        /// Updates the subscription information for a parking lot.
        /// </summary>
        /// <param name="request">The request containing the new subscription details.</param>
        /// <param name="performerId">The unique identifier of the user performing the update.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task<int> UpdateParkingLotSubscription(UpdateParkingLotSubscriptionRequest request, string performerId);

        /// <summary>
        /// Retrieves the API key for the specified parking lot.
        /// </summary>
        /// <param name="parkingLotId">The unique identifier of the parking lot.</param>
        /// <returns>The API key as a string.</returns>
        Task<string> GetParkingLotApiKey(string parkingLotId);

        /// <summary>
        /// Retrieves the client key for the specified parking lot.
        /// </summary>
        /// <param name="parkingLotId">The unique identifier of the parking lot.</param>
        /// <returns>The client key as a string.</returns>
        Task<string> GetParkingLotClientKey(string parkingLotId);

        /// <summary>
        /// Retrieves the checksum key for the specified parking lot.
        /// </summary>
        /// <param name="parkingLotId">The unique identifier of the parking lot.</param>
        /// <returns>The checksum key as a string.</returns>
        Task<string> GetParkingLotCheckSumKey(string parkingLotId);
        Task ConfirmTransaction(PaymentWebHookRequest request);
        Task<SubscriptionDetailsDto?> GetSubscriptionByParkingLotId(string parkingLotId);
        Task<PaymentResponseDto?> GetLatestPaymentByParkingLotId(string parkingLotId);
        Task<bool> IsParkingLotUsingWhiteList(string parkingLotId);
    }
}

