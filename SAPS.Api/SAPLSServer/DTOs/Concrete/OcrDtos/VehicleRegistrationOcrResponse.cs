using SAPLSServer.DTOs.Base;

namespace SAPLSServer.DTOs.Concrete.OcrDtos
{
    public class VehicleRegistrationOcrResponse
    {
        public string? LicensePlate { get; set; }
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public string? EngineNumber { get; set; }
        public string? ChassisNumber { get; set; }
        public string? Color { get; set; }
        public string? OwnerVehicleFullName { get; set; }
        public DateOnly? RegistrationDate { get; set; }
        public string? VehicleType { get; set; }
    }
}

