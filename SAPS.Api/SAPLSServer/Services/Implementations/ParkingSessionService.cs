using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.FileUploadDtos;
using SAPLSServer.DTOs.Concrete.ParkingSessionDtos;
using SAPLSServer.DTOs.Concrete.PaymentDtos;
using SAPLSServer.DTOs.PaginationDto;
using SAPLSServer.Exceptions;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using SAPLSServer.Services.Interfaces;
using System.Linq.Expressions;
using System.Text.Json;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace SAPLSServer.Services.Implementations
{
    public class ParkingSessionService : IParkingSessionService
    {
        private readonly IParkingSessionRepository _parkingSessionRepository;
        private readonly IParkingLotService _parkingLotService;
        private readonly IPaymentService _paymentService;
        private readonly IParkingFeeScheduleService _parkingFeeScheduleService;
        private readonly IVehicleService _vehicleService;
        private readonly IFileService _fileService;
        private readonly IWhiteListService _whiteListService;

        public ParkingSessionService(
            IParkingSessionRepository parkingSessionRepository,
            IParkingLotService parkingLotService,
            IPaymentService paymentService,
            IVehicleService vehicleService,
            ISharedVehicleService sharedVehicleService,
            IFileService fileService,
            IParkingFeeScheduleService parkingFeeScheduleService,
            IWhiteListService whiteListService)
        {
            _parkingSessionRepository = parkingSessionRepository;
            _vehicleService = vehicleService;
            _paymentService = paymentService;
            _parkingLotService = parkingLotService;
            _fileService = fileService;
            _parkingFeeScheduleService = parkingFeeScheduleService;
            _whiteListService = whiteListService;
        }

        public async Task<ParkingSessionDetailsForClientDto?> GetSessionDetailsForClient(string sessionId)
        {
            var session = await _parkingSessionRepository.FindIncludingVehicleAndParkingLotReadOnly(sessionId);
            if (session == null)
                return null;
            if (session.Status == ParkingSessionStatus.Parking.ToString())
                session.Cost = await CalculateSessionFee(session);
            var sessionDto = new ParkingSessionDetailsForClientDto(session);
            if (!string.IsNullOrWhiteSpace(session.PaymentInformation))
            {
                sessionDto.PaymentInformation =
                    JsonSerializer.Deserialize<PaymentResponseDto>(session.PaymentInformation);
            }
            return sessionDto;
        }

        public async Task<ParkingSessionDetailsForParkingLotDto?> GetSessionDetailsForParkingLot(string sessionId)
        {
            var session = await _parkingSessionRepository.Find(sessionId);
            if (session == null)
                return null;
            if (session.VehicleId != null && session.DriverId != null)
            {
                session = await _parkingSessionRepository.FindIncludingVehicleAndDriverReadOnly(sessionId);
            }
            if (session!.Status == ParkingSessionStatus.Parking.ToString())
                session.Cost = await CalculateSessionFee(session);
            return new ParkingSessionDetailsForParkingLotDto(session);
        }

        public async Task<List<ParkingSessionSummaryForClientDto>> GetSessionsByClient(
            GetParkingSessionListByClientIdRequest request)
        {
            var criterias = BuildSessionCriterias(request);
            var sessions = await _parkingSessionRepository.GetAllAsync(criterias.ToArray());
            var result = new List<ParkingSessionSummaryForClientDto>();
            foreach (var session in sessions)
            {
                var sessionIncludingVehicle = await _parkingSessionRepository
                    .FindIncludingVehicleAndParkingLotReadOnly(session.Id);
                if (sessionIncludingVehicle == null)
                {
                    continue;
                }
                if (sessionIncludingVehicle.Status == ParkingSessionStatus.Parking.ToString())
                    sessionIncludingVehicle.Cost = await CalculateSessionFee(sessionIncludingVehicle);
                result.Add(new ParkingSessionSummaryForClientDto(sessionIncludingVehicle));
            }
            return result;
        }

        public async Task<List<ParkingSessionSummaryForParkingLotDto>> GetSessionsByParkingLot(
            GetParkingSessionListByParkingLotIdRequest request)
        {
            var criterias = BuildSessionCriterias(request, s => s.ParkingLotId == request.ParkingLotId);
            var sessions = await _parkingSessionRepository.GetAllAsync(criterias.ToArray());
            var result = new List<ParkingSessionSummaryForParkingLotDto>();
            foreach (var session in sessions)
            {
                if (session.Status == ParkingSessionStatus.Parking.ToString())
                    session.Cost = await CalculateSessionFee(session);
                session.Cost = await CalculateSessionFee(session);
                result.Add(new ParkingSessionSummaryForParkingLotDto(session));
            }
            return result;
        }

        public async Task CheckIn(CheckInParkingSessionRequest request, string staffId)
        {
            if (!await _parkingLotService.IsParkingLotValid(request.ParkingLotId))
                throw new InvalidInformationException(MessageKeys.PARKING_LOT_NOT_FOUND);
            if(await GetByLicensePlateNumber(request.VehicleLicensePlate, request.ParkingLotId) != null)
                throw new InvalidInformationException(MessageKeys.VEHICLE_ALREADY_CHECKED_IN);
            if (await _parkingLotService.IsParkingLotUsingWhiteList(request.ParkingLotId))
            {
                var isWhiteListed = await _whiteListService.IsClientWhitelistedAsync(request.ParkingLotId, staffId);
                if (!isWhiteListed)
                    throw new UnauthorizedAccessException(MessageKeys.CLIENT_NOT_IN_WHITE_LIST);
            }
            var vehicle = await _vehicleService.GetByLicensePlate(request.VehicleLicensePlate);

            var frontCaptureUrl = string.Empty;
            var backCaptureUrl = string.Empty;

            if (request.EntryFrontCapture != null)
            {
                var frontCaptureUploadRequest = new FileUploadRequest
                {
                    File = request.EntryFrontCapture!,
                    Container = "parking-session-captures",
                    SubFolder = $"vehicle-{request.VehicleLicensePlate}",
                    GenerateUniqueFileName = true,
                    Metadata = new Dictionary<string, string>
                    {
                        { "LicensePlate", request.VehicleLicensePlate },
                        { "CaptureType", "EntryFront" }
                    }
                };
                var frontCaptureResult = await _fileService.UploadFileAsync(frontCaptureUploadRequest);
                frontCaptureUrl = frontCaptureResult.CdnUrl;
            }
            if (request.EntryBackCapture != null)
            {
                var backCaptureUploadRequest = new FileUploadRequest
                {
                    File = request.EntryBackCapture!,
                    Container = "parking-session-captures",
                    SubFolder = $"vehicle-{request.VehicleLicensePlate}",
                    GenerateUniqueFileName = true,
                    Metadata = new Dictionary<string, string>
                    {
                        { "LicensePlate", request.VehicleLicensePlate },
                        { "CaptureType", "EntryBack" }
                    }
                };
                var backCaptureResult = await _fileService.UploadFileAsync(backCaptureUploadRequest);
                backCaptureUrl = backCaptureResult.CdnUrl;
            }

            string? driverId = vehicle?.OwnerId ?? null;
            if (vehicle != null && vehicle.SharingStatus == VehicleSharingStatus.Shared.ToString())
            {
                driverId = await _vehicleService.GetCurrentHolderId(vehicle.Id) ?? string.Empty;
            }
            string vehicleType = vehicle?.VehicleType ?? request.VehicleType ?? VehicleType.Motorbike.ToString();
            var session = new ParkingSession
            {
                Id = Guid.NewGuid().ToString(),
                VehicleId = vehicle?.Id ?? null,
                DriverId = driverId,
                LicensePlate = request.VehicleLicensePlate,
                ParkingLotId = request.ParkingLotId,
                VehicleType = vehicleType,
                EntryDateTime = DateTime.UtcNow,
                EntryFrontCaptureUrl = frontCaptureUrl,
                EntryBackCaptureUrl = backCaptureUrl,
                Status = ParkingSessionStatus.Parking.ToString(),
                PaymentStatus = ParkingSessionPayStatus.NotPaid.ToString(),
                PaymentMethod = PaymentMethod.Cash.ToString(),
                Cost = 0,
                TransactionCount = 0,
                CheckInStaffId = staffId,
                ParkingFeeSchedule = await _parkingFeeScheduleService
                    .GetParkingLotCurrentFeeSchedule(request.ParkingLotId,
                    Enum.TryParse<VehicleType>(vehicleType, out var parsedVehicleType) ? parsedVehicleType : VehicleType.Motorbike),
            };

            await _parkingSessionRepository.AddAsync(session);
            await _parkingSessionRepository.SaveChangesAsync();
        }
        public async Task CheckOut(CheckOutParkingSessionRequest request, string userId)
        {
            var session = await _parkingSessionRepository.FindIncludingVehicle(request.SessionId);
            if (session == null)
                throw new InvalidInformationException(MessageKeys.PARKING_SESSION_NOT_FOUND);
            if (userId != session.DriverId)
                throw new UnauthorizedAccessException(MessageKeys.UNAUTHORIZED_ACCESS);
            if (session.Status != ParkingSessionStatus.Parking.ToString())
                throw new InvalidInformationException(MessageKeys.PARKING_SESSION_ALREADY_CHECKED_OUT);

            session.CheckOutDateTime = DateTime.UtcNow;
            session.Cost = await CalculateSessionFee(session);
            session.PaymentMethod = request.PaymentMethod;

            if (request.PaymentMethod == PaymentMethod.Bank.ToString())
            {
                var apiKey = await _parkingLotService.GetParkingLotApiKey(session.ParkingLotId ?? string.Empty);
                var clientKey = await _parkingLotService.GetParkingLotClientKey(session.ParkingLotId ?? string.Empty);
                var checkSumKey = await _parkingLotService.GetParkingLotCheckSumKey(session.ParkingLotId ?? string.Empty);
                
                var paymentResult = await CreatePaymentRequest(session, (int)session.Cost, clientKey, apiKey, checkSumKey);
                session.PaymentStatus = ParkingSessionPayStatus.Pending.ToString();
                session.PaymentInformation = paymentResult.PaymentInformation;
                session.TransactionId = paymentResult.TransactionId;
                session.TransactionCount++;
            }
            _parkingSessionRepository.Update(session);
            await _parkingSessionRepository.SaveChangesAsync();
        }

        public async Task Finish(FinishParkingSessionRequest request, string staffId)
        {
            var vehicle = await _vehicleService.GetByLicensePlate(request.VehicleLicensePlate);
            if (vehicle != null)
            {
                var session = await _parkingSessionRepository.FindLatest(request.VehicleLicensePlate, request.ParkingLotId);
                if (session == null)
                    throw new InvalidInformationException(MessageKeys.PARKING_SESSION_NOT_FOUND);
                if (session.PaymentStatus == ParkingSessionPayStatus.NotPaid.ToString())
                {
                    throw new ParkingSessionException(MessageKeys.PARKING_SESSION_NOT_PAID);
                }
                if(session.Status == ParkingSessionPayStatus.Paid.ToString())
                {
                    var cost = await CalculateSessionFee(session);
                    if(session.Cost < cost)
                    {
                        session.PaymentStatus = ParkingSessionPayStatus.NotPaid.ToString();
                        throw new ParkingSessionException(MessageKeys.PARKING_SESSION_PAYMENT_EXPIRED);
                    }
                }
                var exitFrontCaptureUrl = string.Empty;
                var exitBackCaptureUrl = string.Empty;
                if (request.ExitFrontCapture != null)
                {
                    var frontCaptureUploadRequest = new FileUploadRequest
                    {
                        File = request.ExitFrontCapture,
                        Container = "parking-session-captures",
                        SubFolder = $"vehicle-{request.VehicleLicensePlate}",
                        GenerateUniqueFileName = true,
                        Metadata = new Dictionary<string, string>
                        {
                            { "LicensePlate", request.VehicleLicensePlate },
                            { "CaptureType", "ExitFront" }
                        }
                    };
                    var frontCaptureResult = await _fileService.UploadFileAsync(frontCaptureUploadRequest);
                    exitFrontCaptureUrl = frontCaptureResult.CdnUrl;
                }
                if (request.ExitBackCapture != null)
                {
                    var backCaptureUploadRequest = new FileUploadRequest
                    {
                        File = request.ExitBackCapture,
                        Container = "parking-session-captures",
                        SubFolder = $"vehicle-{request.VehicleLicensePlate}",
                        GenerateUniqueFileName = true,
                        Metadata = new Dictionary<string, string>
                        {
                            { "LicensePlate", request.VehicleLicensePlate },
                            { "CaptureType", "ExitBack" }
                        }
                    };
                    var backCaptureResult = await _fileService.UploadFileAsync(backCaptureUploadRequest);
                    exitBackCaptureUrl = backCaptureResult.CdnUrl;
                }

                session.Status = ParkingSessionStatus.Finished.ToString();
                session.ExitFrontCaptureUrl = exitFrontCaptureUrl;
                session.ExitBackCaptureUrl = exitBackCaptureUrl;
                session.CheckOutStaffId = staffId;
                session.ExitDateTime = DateTime.UtcNow;
                _parkingSessionRepository.Update(session);
                await _parkingSessionRepository.SaveChangesAsync();
            }
            throw new InvalidInformationException(MessageKeys.PARKING_SESSION_NOT_FOUND);
        }
        public async Task ForceFinish(FinishParkingSessionRequest request, string staffId)
        {
            var session = await _parkingSessionRepository.FindLatest(request.VehicleLicensePlate, request.ParkingLotId);
            if (session == null)
                throw new InvalidInformationException(MessageKeys.PARKING_SESSION_NOT_FOUND);
            var exitFrontCaptureUrl = string.Empty;
            var exitBackCaptureUrl = string.Empty;
            if (request.ExitFrontCapture != null)
            {
                var frontCaptureUploadRequest = new FileUploadRequest
                {
                    File = request.ExitFrontCapture,
                    Container = "parking-session-captures",
                    SubFolder = $"vehicle-{request.VehicleLicensePlate}",
                    GenerateUniqueFileName = true,
                    Metadata = new Dictionary<string, string>
                {
                    { "LicensePlate" , request.VehicleLicensePlate },
                    { "CaptureType", "ExitFront" }
                }
                };
                var frontCaptureResult = await _fileService.UploadFileAsync(frontCaptureUploadRequest);
                exitFrontCaptureUrl = frontCaptureResult.CdnUrl;
            }
            if (request.ExitBackCapture != null)
            {
                var backCaptureUploadRequest = new FileUploadRequest
                {
                    File = request.ExitBackCapture,
                    Container = "parking-session-captures",
                    SubFolder = $"vehicle-{request.VehicleLicensePlate}",
                    GenerateUniqueFileName = true,
                    Metadata = new Dictionary<string, string>
                {
                    { "LicensePlate" , request.VehicleLicensePlate },
                    { "CaptureType", "ExitBack" }
                }
                };
                var backCaptureResult = await _fileService.UploadFileAsync(backCaptureUploadRequest);
                exitBackCaptureUrl = backCaptureResult.CdnUrl;
            }
            if (session.PaymentMethod == null)
            {
                session.PaymentMethod = PaymentMethod.Bank.ToString();
            }
            else
            {
                session.PaymentMethod = PaymentMethod.Cash.ToString();
            }
            session.Status = ParkingSessionStatus.Finished.ToString();
            session.ExitFrontCaptureUrl = exitFrontCaptureUrl;
            session.ExitBackCaptureUrl = exitBackCaptureUrl;
            session.CheckOutStaffId = staffId;
            session.PaymentStatus = ParkingSessionPayStatus.Paid.ToString();
            session.ExitDateTime = DateTime.UtcNow;
            session.Cost = await CalculateSessionFee(session);
            _parkingSessionRepository.Update(session);
            await _parkingSessionRepository.SaveChangesAsync();
        }
        public async Task<List<ParkingSessionSummaryForClientDto>> GetOwnedSessions(
            GetOwnedParkingSessionListRequest request, string clientId)
        {
            var criterias = BuildSessionCriterias(request, s => s.DriverId == clientId);
            var sortBy = GetSortByExpression(request.SortBy);
            var orderBy = IsAscending(request.Order);
            var sessions = await _parkingSessionRepository.GetAllAsync(criterias.ToArray(), sortBy, orderBy);
            var result = new List<ParkingSessionSummaryForClientDto>();
            foreach (var session in sessions)
            {
                var sessionIncludingVehicleAndParkingLot = await _parkingSessionRepository
                    .FindIncludingVehicleAndParkingLot(session.Id);
                if (sessionIncludingVehicleAndParkingLot == null)
                {
                    continue;
                }
                if (sessionIncludingVehicleAndParkingLot.Status != ParkingSessionStatus.CheckedOut.ToString())
                    sessionIncludingVehicleAndParkingLot.Cost = await
                        CalculateSessionFee(sessionIncludingVehicleAndParkingLot);
                result.Add(new ParkingSessionSummaryForClientDto(sessionIncludingVehicleAndParkingLot));
            }
            return result;
        }

        public async Task<PageResult<ParkingSessionSummaryForClientDto>> GetPageByClient(PageRequest pageRequest,
            GetParkingSessionListByClientIdRequest listRequest)
        {
            var criterias = BuildSessionCriterias(listRequest);
            var sortBy = GetSortByExpression(listRequest.SortBy);
            var orderBy = IsAscending(listRequest.Order);
            var totalCount = await _parkingSessionRepository.CountAsync(criterias.ToArray());
            var page = await _parkingSessionRepository.GetPageAsync(pageRequest.PageNumber, pageRequest.PageSize,
                criterias.ToArray(), sortBy, orderBy);
            var items = new List<ParkingSessionSummaryForClientDto>();
            foreach (var session in page)
            {
                var sessionIncludingVehicleAndParkingLot = await _parkingSessionRepository
                    .FindIncludingVehicleAndParkingLotReadOnly(session.Id);
                if (sessionIncludingVehicleAndParkingLot == null)
                {
                    continue;
                }
                if (sessionIncludingVehicleAndParkingLot.Status != ParkingSessionStatus.CheckedOut.ToString())
                    sessionIncludingVehicleAndParkingLot.Cost = await CalculateSessionFee(sessionIncludingVehicleAndParkingLot);
                items.Add(new ParkingSessionSummaryForClientDto(sessionIncludingVehicleAndParkingLot));
            }
            return new PageResult<ParkingSessionSummaryForClientDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageRequest.PageNumber,
                PageSize = pageRequest.PageSize,
            };
        }

        public async Task<PageResult<ParkingSessionSummaryForParkingLotDto>> GetPageByParkingLot(PageRequest pageRequest,
            GetParkingSessionListByParkingLotIdRequest listRequest)
        {
            var criterias = BuildSessionCriterias(listRequest, s => s.ParkingLotId == listRequest.ParkingLotId);
            var sortBy = GetSortByExpression(listRequest.SortBy);
            var orderBy = IsAscending(listRequest.Order);
            var totalCount = await _parkingSessionRepository.CountAsync(criterias.ToArray());
            var page = await _parkingSessionRepository.GetPageAsync(pageRequest.PageNumber, pageRequest.PageSize,
                criterias.ToArray(), sortBy, orderBy);
            var items = new List<ParkingSessionSummaryForParkingLotDto>();
            foreach (var session in page)
            {
                if (session.Status != ParkingSessionStatus.CheckedOut.ToString())
                    session.Cost = await CalculateSessionFee(session);
                items.Add(new ParkingSessionSummaryForParkingLotDto(session));
            }
            return new PageResult<ParkingSessionSummaryForParkingLotDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageRequest.PageNumber,
                PageSize = pageRequest.PageSize,
            };
        }

        public async Task<PageResult<ParkingSessionSummaryForClientDto>> GetPageByOwnedSessions(
             PageRequest pageRequest, GetOwnedParkingSessionListRequest listRequest, string clientId)
        {
            var criterias = BuildSessionCriterias(listRequest, s => s.DriverId == clientId);
            var sortBy = GetSortByExpression(listRequest.SortBy);
            var orderBy = IsAscending(listRequest.Order);
            var totalCount = await _parkingSessionRepository.CountAsync(criterias.ToArray());
            var page = await _parkingSessionRepository.GetPageAsync(
                pageRequest.PageNumber, pageRequest.PageSize, criterias.ToArray(), sortBy, orderBy);
            var items = new List<ParkingSessionSummaryForClientDto>();
            foreach (var session in page)
            {

                if (session.Status != ParkingSessionStatus.CheckedOut.ToString())
                    session.Cost = await CalculateSessionFee(session);
                items.Add(new ParkingSessionSummaryForClientDto(session));
            }
            return new PageResult<ParkingSessionSummaryForClientDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageRequest.PageNumber,
                PageSize = pageRequest.PageSize,
            };
        }

        private static List<Expression<Func<ParkingSession, bool>>> BuildSessionCriterias(GetOwnedParkingSessionListRequest request,
            Expression<Func<ParkingSession, bool>>? extra = null)
        {
            var criterias = new List<Expression<Func<ParkingSession, bool>>>();
            if (extra != null)
                criterias.Add(extra);
            if (!string.IsNullOrWhiteSpace(request.Status))
                criterias.Add(s => s.Status == request.Status);
            if (request.StartEntryDate.HasValue)
                criterias.Add(s => s.EntryDateTime.Date
                >= request.StartEntryDate.Value.ToDateTime(TimeOnly.MinValue).Date);
            if (request.EndEntryDate.HasValue)
                criterias.Add(s => s.EntryDateTime.Date
                <= request.EndEntryDate.Value.ToDateTime(TimeOnly.MaxValue).Date);
            if (request.StartExitDate.HasValue)
                criterias.Add(s => s.ExitDateTime.HasValue && s.ExitDateTime.Value.Date
                >= request.StartExitDate.Value.ToDateTime(TimeOnly.MinValue).Date);
            if (request.EndExitDate.HasValue)
                criterias.Add(s => s.ExitDateTime.HasValue && s.ExitDateTime.Value.Date
                <= request.EndExitDate.Value.ToDateTime(TimeOnly.MaxValue).Date);
            if (!string.IsNullOrWhiteSpace(request.SearchCriteria))
                criterias.Add(s => s.LicensePlate.Contains(request.SearchCriteria));
            return criterias;
        }


        private static Expression<Func<ParkingSession, object>> GetSortByExpression(string? sortBy)
        {
            if (string.IsNullOrWhiteSpace(sortBy))
                return s => s.EntryDateTime;

            switch (sortBy.Trim().ToLower())
            {
                case "entrydatetime":
                    return s => s.EntryDateTime;
                case "exitdatetime":
                    return s => s.ExitDateTime ?? DateTime.MinValue;
                case "status":
                    return s => s.Status;
                case "cost":
                    return s => s.Cost;
                default:
                    return s => s.EntryDateTime;
            }
        }

        private static bool IsAscending(string? order)
        {
            return string.Equals(order, OrderType.Asc.ToString(), StringComparison.OrdinalIgnoreCase);
        }

        private async Task<decimal> CalculateSessionFee(ParkingSession session)
        {
            if(session.PaymentStatus == ParkingSessionPayStatus.Paid.ToString())
            {
                return session.Cost;
            }
            if (session.ParkingFeeSchedule != null)
            {
                var totalCost = await _parkingFeeScheduleService.CalculateParkingSessionFee(
                    session.ParkingFeeSchedule,
                    session.EntryDateTime,
                    DateTime.UtcNow
                );
                return totalCost - session.Cost;
            }
            else
            {
                var feeSchedule = await _parkingFeeScheduleService.GetParkingLotCurrentFeeSchedule(session.ParkingLotId ?? string.Empty,
                    Enum.TryParse<VehicleType>(session.VehicleType, out var parsedVehicleType) ? parsedVehicleType : VehicleType.Motorbike);
                if (feeSchedule != null)
                {
                    return await _parkingFeeScheduleService.CalculateParkingSessionFee(
                        feeSchedule,
                        session.EntryDateTime,
                        DateTime.UtcNow);
                }
                return 0;
            }
        }

        /// <summary>
        /// Creates a payment request for a parking session with bank payment method.
        /// This method consolidates the payment request logic used in both CheckOut and GetSessionPaymentInfo.
        /// </summary>
        /// <param name="session">The parking session for which to create the payment request</param>
        /// <param name="amount">The amount to be charged for the payment</param>
        /// <param name="clientKey">The client key for the payment gateway</param>
        /// <param name="apiKey">The API key for the payment gateway</param>
        /// <param name="checkSumKey">The checksum key for signature generation</param>
        /// <returns>A PaymentCreationResult containing the serialized payment information and transaction ID</returns>
        private async Task<PaymentCreationResult> CreatePaymentRequest(ParkingSession session, int amount, string clientKey, string apiKey, string checkSumKey)
        {
            int transactionId = new Random().Next(1, int.MaxValue);
            
            string data = $"amount={amount}&cancelUrl={""}&description=SESS{transactionId}&orderCode={transactionId}&returnUrl={""}";
            var signature = _paymentService.GenerateSignature(data, checkSumKey);
            
            // Prepare payment request
            var paymentRequest = new PaymentRequestDto
            {
                OrderCode = transactionId,
                Amount = amount,
                Description = $"SESS{transactionId}",
                CancelUrl = "",
                ReturnUrl = "",
                Signature = signature,
                BuyerName = session.Driver?.User?.FullName,
                BuyerEmail = session.Driver?.User?.Email,
                BuyerPhone = session.Driver?.User?.Phone,
                BuyerAddress = string.Empty,
                ExpiredAt = (int)DateTime.UtcNow.AddMinutes(BusinessRules.PAYMENT_DURATION_IN_MINUTES).ToUniversalTime().Subtract(DateTime.UnixEpoch).TotalSeconds,
                Items = new List<DTOs.Concrete.PaymentDtos.PaymentItemDto>
                {
                    new DTOs.Concrete.PaymentDtos.PaymentItemDto
                    {
                        Name = "Parking Fee",
                        Quantity = 1,
                        Price = amount
                    }
                },
            };

            // Send payment request
            var response = await _paymentService.SendPaymentRequest(paymentRequest, clientKey, apiKey, checkSumKey);
            if (response == null)
                throw new InvalidOperationException(MessageKeys.PAYOS_SERVICE_UNAVAILABLE);
            
            var responseData = JsonSerializer.Serialize(response);
            
            return new PaymentCreationResult
            {
                PaymentInformation = responseData,
                TransactionId = transactionId
            };
        }

        public async Task<int?> GetSessionTransactionId(string sessionId)
        {
            var session = await _parkingSessionRepository.Find(sessionId);
            if (session == null)
            {
                return null;
            }
            return session.TransactionId;
        }

        public async Task<PaymentResponseDto?> GetSessionPaymentInfo(string sessionId)
        {
            var session = await _parkingSessionRepository.Find(sessionId);
            if (session == null)
            {
                throw new InvalidInformationException(MessageKeys.PARKING_SESSION_NOT_FOUND);
            }
            if (string.IsNullOrWhiteSpace(session.PaymentInformation))
            {
                throw new InvalidInformationException(MessageKeys.PARKING_SESSION_PAYMENT_INFO_NOT_FOUND);
            }
            if(session.PaymentStatus == ParkingSessionPayStatus.Paid.ToString())
            {
                throw new InvalidInformationException(MessageKeys.PARKING_SESSION_ALREADY_PAID);
            }   

            var clientKey = await _parkingLotService.GetParkingLotClientKey(session.ParkingLotId ?? string.Empty);
            var apiKey = await _parkingLotService.GetParkingLotApiKey(session.ParkingLotId ?? string.Empty);

            var paymentStatus = await _paymentService.GetPaymentStatus((int)session.TransactionId!, clientKey, apiKey);
            if (paymentStatus != null)
            {
                if (paymentStatus.Data != null)
                {
                    var data = paymentStatus.Data;
                    var cost = await CalculateSessionFee(session);
                    if (data.Status == PayOSPaymentStatus.UNDERPAID.ToString())
                    {
                        cost = data.AmountRemaining;
                    }
                    if (data.Status == PayOSPaymentStatus.EXPIRED.ToString() || 
                        data.Status == PayOSPaymentStatus.UNDERPAID.ToString() ||
                        data.Status == PayOSPaymentStatus.CANCELLED.ToString())
                    {
                        var checkSumKey = await _parkingLotService.GetParkingLotCheckSumKey(session.ParkingLotId ?? string.Empty);
                        var paymentResult = await CreatePaymentRequest(session, (int)cost, clientKey, apiKey, checkSumKey);
                        session.TransactionId = paymentResult.TransactionId;
                        session.TransactionCount++;
                        session.PaymentStatus = ParkingSessionPayStatus.Pending.ToString();
                        session.PaymentInformation = paymentResult.PaymentInformation;
                            
                        _parkingSessionRepository.Update(session);
                        await _parkingSessionRepository.SaveChangesAsync();
                    }
                    else if(data.Status == PayOSPaymentStatus.PAID.ToString())
                    {
                        return null;
                    }
                }
            }

            var paymentInfo = JsonSerializer.Deserialize<PaymentResponseDto>(session.PaymentInformation);

            return paymentInfo;
        }
        public async Task<PaymentResponseDto?> GetSessionPaymentInfoByStaff(string sessionId, string staffId)
        {
            var session = await _parkingSessionRepository.Find(sessionId);
            if (session == null)
            {
                throw new InvalidInformationException(MessageKeys.PARKING_SESSION_NOT_FOUND);
            }
            
            if (session.PaymentStatus == ParkingSessionPayStatus.Paid.ToString())
            {
                throw new InvalidInformationException(MessageKeys.PARKING_SESSION_ALREADY_PAID);
            }

            var clientKey = await _parkingLotService.GetParkingLotClientKey(session.ParkingLotId ?? string.Empty);
            var apiKey = await _parkingLotService.GetParkingLotApiKey(session.ParkingLotId ?? string.Empty);

            if (session.PaymentInformation == null)
            {
                var checkSumKey = await _parkingLotService.GetParkingLotCheckSumKey(session.ParkingLotId ?? string.Empty);
                var cost = await CalculateSessionFee(session);
                var paymentResult = await CreatePaymentRequest(session, (int)cost, clientKey, apiKey, checkSumKey);
                session.TransactionId = paymentResult.TransactionId;
                session.TransactionCount++;
                session.PaymentStatus = ParkingSessionPayStatus.Pending.ToString();
                session.PaymentInformation = paymentResult.PaymentInformation;

                _parkingSessionRepository.Update(session);
                await _parkingSessionRepository.SaveChangesAsync();
            }

            var paymentStatus = await _paymentService.GetPaymentStatus((int)session.TransactionId!, clientKey, apiKey);
            if (paymentStatus != null)
            {
                if (paymentStatus.Data != null)
                {
                    var data = paymentStatus.Data;
                    var cost = await CalculateSessionFee(session);
                    if(data.Status == PayOSPaymentStatus.UNDERPAID.ToString())
                    {
                        cost = data.AmountRemaining;
                    }
                    if (data.Status == PayOSPaymentStatus.EXPIRED.ToString() ||
                        data.Status == PayOSPaymentStatus.UNDERPAID.ToString() ||
                        data.Status == PayOSPaymentStatus.CANCELLED.ToString())
                    {
                        var checkSumKey = await _parkingLotService.GetParkingLotCheckSumKey(session.ParkingLotId ?? string.Empty);
                        var paymentResult = await CreatePaymentRequest(session, (int)cost, clientKey, apiKey, checkSumKey);
                        session.TransactionId = paymentResult.TransactionId;
                        session.TransactionCount++;
                        session.PaymentStatus = ParkingSessionPayStatus.Pending.ToString();
                        session.PaymentInformation = paymentResult.PaymentInformation;

                        _parkingSessionRepository.Update(session);
                        await _parkingSessionRepository.SaveChangesAsync();
                    }
                    else if (data.Status == PayOSPaymentStatus.PAID.ToString())
                    {
                        return null;
                    }
                }
            }

            var paymentInfo = JsonSerializer.Deserialize<PaymentResponseDto>(session.PaymentInformation);

            return paymentInfo;
        }
        public async Task ConfirmTransaction(PaymentWebHookRequest request)
        {
            var session = await _parkingSessionRepository.Find([p => p.TransactionId == request.Data.OrderCode]);
            if (session != null)
            {
                if (request.Success)
                {
                    session.PaymentStatus = ParkingSessionPayStatus.Paid.ToString();
                    if(session.PaymentMethod == null)
                    {
                        session.PaymentMethod = PaymentMethod.Bank.ToString();
                    }
                    session.Cost = request.Data.Amount;
                    session.Status = ParkingSessionStatus.CheckedOut.ToString();
                }
                else
                {
                    session.PaymentStatus = ParkingSessionPayStatus.NotPaid.ToString();
                    session.Status = ParkingSessionStatus.Parking.ToString();
                }
                _parkingSessionRepository.Update(session);
                await _parkingSessionRepository.SaveChangesAsync();
            }
        }

        public async Task<ParkingSessionDetailsForParkingLotDto?> GetByLicensePlateNumber(string licensePlateNumber, string parkingLotId)
        {
            var session = await _parkingSessionRepository.FindLatest(licensePlateNumber, parkingLotId);
            if (session == null || session.Status == ParkingSessionStatus.Finished.ToString())
            {
                return null;
            }
            var vehicle = await _vehicleService.GetByLicensePlate(licensePlateNumber);
            if (vehicle != null)
            {
                session = await _parkingSessionRepository.FindIncludingVehicleAndDriverReadOnly(session.Id);
            }
            session!.Cost = await CalculateSessionFee(session);
            return new ParkingSessionDetailsForParkingLotDto(session);
        }

        public async Task<ParkingSessionDetailsForClientDto?> GetCurrentParkingSession(string vehicleId)
        {
            var session = await _parkingSessionRepository.FindLatest(vehicleId);
            if (session == null || session.Status == ParkingSessionStatus.Finished.ToString())
            {
                return null;
            }
            session!.Cost = await CalculateSessionFee(session);
            return new ParkingSessionDetailsForClientDto(session);
        }

        public async Task<PaymentStatusResponseDto?> GetPaymentStatus(string parkingSessionId)
        {
            var parkingSession = await _parkingSessionRepository.Find(parkingSessionId)
                ?? throw new InvalidOperationException(MessageKeys.PARKING_SESSION_NOT_FOUND);

            if (parkingSession.PaymentInformation == null)
            {
                throw new InvalidOperationException(MessageKeys.PARKING_SESSION_PAYMENT_INFO_NOT_FOUND);
            }

            int paymentId = JsonSerializer.Deserialize<PaymentResponseDto>(parkingSession.PaymentInformation)!.Data!.OrderCode;

            if (parkingSession.ParkingLotId == null)
            {
                throw new InvalidOperationException(MessageKeys.PARKING_LOT_NOT_FOUND);
            }
            string clientKey = await _parkingLotService.GetParkingLotClientKey(parkingSession.ParkingLotId)
                ?? throw new InvalidOperationException(MessageKeys.PARKING_LOT_CLIENT_KEY_NOT_FOUND);

            string apiKey = await _parkingLotService.GetParkingLotApiKey(parkingSession.ParkingLotId);


            return await _paymentService.GetPaymentStatus(paymentId, clientKey, apiKey);
        }
        public async Task<PaymentStatusResponseDto?> SendCancelPaymentRequest(PaymentCancelRequestDto request, string parkingSessionId)
        {
            var parkingSession = await _parkingSessionRepository.Find(parkingSessionId)
                ?? throw new InvalidOperationException(MessageKeys.PARKING_SESSION_NOT_FOUND);

            if (parkingSession.PaymentInformation == null)
            {
                throw new InvalidOperationException(MessageKeys.PARKING_SESSION_PAYMENT_INFO_NOT_FOUND);
            }

            int paymentId = JsonSerializer.Deserialize<PaymentResponseDto>(parkingSession.PaymentInformation)!.Data!.OrderCode;

            if (parkingSession.ParkingLotId == null)
            {
                throw new InvalidOperationException(MessageKeys.PARKING_LOT_NOT_FOUND);
            }
            string clientKey = await _parkingLotService.GetParkingLotClientKey(parkingSession.ParkingLotId)
                ?? throw new InvalidOperationException(MessageKeys.PARKING_LOT_CLIENT_KEY_NOT_FOUND);

            string apiKey = await _parkingLotService.GetParkingLotApiKey(parkingSession.ParkingLotId);

            return await _paymentService.SendCancelPaymentRequest(paymentId, clientKey, apiKey, request);
        }

        /// <summary>
        /// Represents the result of creating a payment request, containing the serialized payment information and transaction ID.
        /// </summary>
        private class PaymentCreationResult
        {
            public string PaymentInformation { get; set; } = string.Empty;
            public int TransactionId { get; set; }
        }
    }
}