using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using System;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.ParkingFeeScheduleDtos
{
    public class ParkingFeeScheduleDto : GetResult
    {
        public int StartTime { get; set; }
        public int EndTime { get; set; }
        public decimal InitialFee { get; set; }
        public int InitialMinutes { get; set; }
        public decimal AdditionalFee { get; set; }
        public int AdditionalMinutes { get; set; }
        public string? DayOfWeeks { get; set; }
        public bool IsActive { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string ForVehicleType { get; set; } = null!;
        public string ParkingLotId { get; set; } = null!;
    }
}