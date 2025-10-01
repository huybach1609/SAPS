using SAPLDesktopApp.DTOs.Base;
using System;
using System.ComponentModel.DataAnnotations;

namespace SAPLDesktopApp.DTOs.Concrete.ParkingSessionDtos
{
    public class GetOwnedParkingSessionListRequest : GetListRequest
    {
        public string? Status { get; set; }
        public DateOnly? StartEntryDate { get; set; }
        public DateOnly? EndEntryDate { get; set; }
        public DateOnly? StartExitDate { get; set; }
        public DateOnly? EndExitDate { get; set; }
    }
}
