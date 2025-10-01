using SAPLDesktopApp.DTOs.Concrete.VehicleDtos;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    public interface IVehicleService
    {
        Task<VehicleDetailsDto?> GetVehicleByLicensePlateAsync(string licensePlate);
    }
}