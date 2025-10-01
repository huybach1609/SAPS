using SAPLSServer.DTOs.Concrete.ParkingSessionDtos;
using SAPLSServer.DTOs.Concrete.PaymentDtos;
using SAPLSServer.DTOs.PaginationDto;

namespace SAPLSServer.Services.Interfaces
{
    /// <summary>
    /// Provides operations for managing parking sessions, including creation, check-in, check-out, finishing, and retrieval of session details and summaries.
    /// </summary>
    public interface IParkingSessionService
    {
        /// <summary>
        /// Gets detailed information about a parking session for a specific client.
        /// </summary>
        /// <param name="sessionId">The ID of the parking session.</param>
        /// <returns>Parking session details for the client, or null if not found.</returns>
        Task<ParkingSessionDetailsForClientDto?> GetSessionDetailsForClient(string sessionId);

        /// <summary>
        /// Gets detailed information about a parking session for a specific parking lot.
        /// </summary>
        /// <param name="sessionId">The ID of the parking session.</param>
        /// <returns>Parking session details for the parking lot, or null if not found.</returns>
        Task<ParkingSessionDetailsForParkingLotDto?> GetSessionDetailsForParkingLot(string sessionId);

        /// <summary>
        /// Retrieves a list of parking session summaries for a client based on the specified request.
        /// </summary>
        /// <param name="request">The request containing client and filter information.</param>
        /// <returns>List of parking session summaries for the client.</returns>
        Task<List<ParkingSessionSummaryForClientDto>> GetSessionsByClient(
            GetParkingSessionListByClientIdRequest request);

        /// <summary>
        /// Retrieves a list of parking session summaries for a parking lot based on the specified request.
        /// </summary>
        /// <param name="request">The request containing parking lot and filter information.</param>
        /// <returns>List of parking session summaries for the parking lot.</returns>
        Task<List<ParkingSessionSummaryForParkingLotDto>> GetSessionsByParkingLot(
            GetParkingSessionListByParkingLotIdRequest request);

        /// <summary>
        /// Checks in a vehicle and creates a new parking session.
        /// Handles file upload for entry captures and associates the session with the correct driver and staff.
        /// </summary>
        /// <param name="request">The check-in request details, including entry capture files.</param>
        /// <param name="staffId">The ID of the staff performing the check-in.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task CheckIn(CheckInParkingSessionRequest request, string staffId);

        /// <summary>
        /// Checks out a vehicle and updates the corresponding parking session.
        /// Sets the session status to CheckedOut, records the check-out time, and recalculates the cost.
        /// </summary>
        /// <param name="request">The check-out request details.</param>
        /// <param name="userId">The ID of the user performing the check-out.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task CheckOut(CheckOutParkingSessionRequest request, string userId);

        /// <summary>
        /// Finishes the corresponding parking session, uploads exit capture files, and updates session status.
        /// </summary>
        /// <param name="request">The finish request details, including exit capture files.</param>
        /// <param name="staffId">The ID of the staff performing the finish operation.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task Finish(FinishParkingSessionRequest request, string staffId);

        /// <summary>
        /// Retrieves a list of parking sessions owned by a client based on the specified request.
        /// </summary>
        /// <param name="request">The request containing ownership and filter information.</param>
        /// <param name="clientId">The ID of the client who owns the sessions.</param>
        /// <returns>List of owned parking session summaries for the client.</returns>
        Task<List<ParkingSessionSummaryForClientDto>> GetOwnedSessions(GetOwnedParkingSessionListRequest request, string clientId);

        /// <summary>
        /// Retrieves a paged list of parking session summaries for a client.
        /// </summary>
        /// <param name="pageRequest">The page request containing client and paging information.</param>
        /// <param name="listRequest">The filter and search criteria for the client sessions.</param>
        /// <returns>Paged result of parking session summaries for the client.</returns>
        Task<PageResult<ParkingSessionSummaryForClientDto>> GetPageByClient(PageRequest pageRequest,
            GetParkingSessionListByClientIdRequest listRequest);

        /// <summary>
        /// Retrieves a paged list of parking session summaries for a parking lot.
        /// </summary>
        /// <param name="request">The page request containing parking lot and paging information.</param>
        /// <param name="listRequest">The filter and search criteria for the parking lot sessions.</param>
        /// <returns>Paged result of parking session summaries for the parking lot.</returns>
        Task<PageResult<ParkingSessionSummaryForParkingLotDto>> GetPageByParkingLot(PageRequest pageRequest,
            GetParkingSessionListByParkingLotIdRequest listRequest);

        /// <summary>
        /// Retrieves a paged list of parking sessions owned by a client.
        /// </summary>
        /// <param name="request">The page request containing paging information.</param>
        /// <param name="listRequest">The filter and search criteria for the owned sessions.</param>
        /// <param name="clientId">The ID of the client who owns the sessions.</param>
        /// <returns>Paged result of owned parking session summaries for the client.</returns>
        Task<PageResult<ParkingSessionSummaryForClientDto>> GetPageByOwnedSessions(PageRequest pageRequest,
            GetOwnedParkingSessionListRequest listRequest, string clientId);

        Task<int?> GetSessionTransactionId(string sessionId);

        Task<PaymentResponseDto?> GetSessionPaymentInfo(string sessionId);

        /// <summary>
        /// Confirms a transaction for a parking session based on the provided payment webhook request.
        /// </summary>
        /// <param name="request">The payment webhook request containing transaction details.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task ConfirmTransaction(PaymentWebHookRequest request);
        Task<ParkingSessionDetailsForParkingLotDto?> GetByLicensePlateNumber(string licensePlateNumber, string parkingLotId);
        Task ForceFinish(FinishParkingSessionRequest request, string staffId);
        Task<ParkingSessionDetailsForClientDto?> GetCurrentParkingSession(string vehicleId);

        Task<PaymentStatusResponseDto?> SendCancelPaymentRequest(PaymentCancelRequestDto request, string parkingSessionId);
        Task<PaymentStatusResponseDto?> GetPaymentStatus(string parkingSessionId);
        Task<PaymentResponseDto?> GetSessionPaymentInfoByStaff(string sessionId, string staffId);
    }
}