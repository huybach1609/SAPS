using SAPLDesktopApp.DTOs.Concrete.ParkingSessionDtos;
using SAPLDesktopApp.Dtos.PaymentDtos;
using SAPLDesktopApp.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    public interface IParkingSessionService : IDisposable
    {
        Task CheckInAsync(CheckInParkingSessionRequest request);
        Task AutomaticallyCheckOutAsync(FinishParkingSessionRequest request);
        Task ManuallyCheckOutAsync(FinishParkingSessionRequest request);
        Task<List<ParkingSessionItem>> GetParkingSessionList(string parkingLotId);
        Task<ParkingSessionDetailsForParkingLotDto?> GetActiveSessionDetailsAsync(string parkingLotId, string licensePlate);
        Task<ParkingSessionDetailsForParkingLotDto?> GetParkingSessionDetailsAsync(string sessionId);
        Task<PaymentApiResponseDto?> GetSessionPaymentInfoAsync(string sessionId);
    }
}