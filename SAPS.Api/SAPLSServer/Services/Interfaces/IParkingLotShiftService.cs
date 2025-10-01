using SAPLSServer.DTOs.Concrete.ParkingLotShiftDtos;

namespace SAPLSServer.Services.Interfaces
{
    public interface IParkingLotShiftService
    {
        Task<List<ParkingLotShiftDto>> GetShiftsByParkingLotAsync(string parkingLotId);
        Task<ParkingLotShiftDto?> GetShiftByIdAsync(string id);
        Task<ParkingLotShiftDto> CreateShiftAsync(CreateParkingLotShiftRequest request, string performerId);
        Task<bool> UpdateShiftAsync(UpdateParkingLotShiftRequest request, string performerId);
        Task<bool> DeleteShiftAsync(string id, string performerId);
    }
}