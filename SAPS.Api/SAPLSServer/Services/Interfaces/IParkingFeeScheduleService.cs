using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.ParkingFeeScheduleDtos;

namespace SAPLSServer.Services.Interfaces
{
    public interface IParkingFeeScheduleService
    {
        Task<ParkingFeeScheduleDto> CreateAsync(CreateParkingFeeScheduleRequest request, string performerId);
        Task<ParkingFeeScheduleDto> UpdateAsync(UpdateParkingFeeScheduleRequest request, string performerId);
        Task<List<ParkingFeeScheduleDto>> GetListByParkingLotAsync(string parkingLotId, string performerId);
        Task<ParkingFeeScheduleDto?> GetByIdAsync(string id, string performerId);
        Task<string> GetParkingLotCurrentFeeSchedule(string parkingLotId, VehicleType vehicleType);
        Task<decimal> CalculateParkingSessionFee(string scheduleId, DateTime startTime, DateTime endTime);
    }
}