using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.ParkingSessionDtos
{
    public class GetOwnedParkingSessionListRequest : GetListRequest
    {
        [EnumDataType(typeof(ParkingSessionStatus), ErrorMessage = MessageKeys.INVALID_PARKING_SESSION_STATUS)]
        public string? Status { get; set; }
        [DataType(DataType.Date, ErrorMessage = MessageKeys.INVALID_DATE_FORMAT)]
        public DateOnly? StartEntryDate { get; set; }
        [DataType(DataType.Date, ErrorMessage = MessageKeys.INVALID_DATE_FORMAT)]
        public DateOnly? EndEntryDate { get; set; }
        [DataType(DataType.Date, ErrorMessage = MessageKeys.INVALID_DATE_FORMAT)]
        public DateOnly? StartExitDate { get; set; }
        [DataType(DataType.Date, ErrorMessage = MessageKeys.INVALID_DATE_FORMAT)]
        public DateOnly? EndExitDate { get; set; }
    }
}
