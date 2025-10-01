using SAPLSServer.DTOs.Base;
using SAPLSServer.DTOs.Concrete.UserDtos;
using SAPLSServer.DTOs.Concrete.VehicleDtos;
using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.ParkingSessionDtos
{
    public class ParkingSessionDetailsForParkingLotDto : GetResult
    {
        public VehicleSummaryDto? Vehicle { get; set; }
        public UserSummaryDto? Owner { get; set; }
        public string LicensePlate { get; set; }
        public DateTime EntryDateTime { get; set; }

        public DateTime? ExitDateTime { get; set; }

        public DateTime? CheckOutDateTime { get; set; }

        public string? EntryFrontCaptureUrl { get; set; }

        public string? EntryBackCaptureUrl { get; set; }

        public string? ExitFrontCaptureUrl { get; set; }

        public string? ExitBackCaptureUrl { get; set; }
        public string? PaymentMethod { get; set; }
        public decimal Cost { get; set; }
        public string Status { get; set; }
        public string PaymentStatus { get; set; }
        public ParkingSessionDetailsForParkingLotDto(ParkingSession session)
        {
            Id = session.Id;
            if (session.Vehicle != null)
            {
                Vehicle = new VehicleSummaryDto(session.Vehicle);
            }
            if (session.Driver != null)
            {
                Owner = new UserSummaryDto(session.Driver.User);
            }
            LicensePlate = session.LicensePlate;
            EntryDateTime = session.EntryDateTime;
            ExitDateTime = session.ExitDateTime;
            CheckOutDateTime = session.CheckOutDateTime;
            EntryFrontCaptureUrl = session.EntryFrontCaptureUrl;
            EntryBackCaptureUrl = session.EntryBackCaptureUrl;
            ExitFrontCaptureUrl = session.ExitFrontCaptureUrl;
            ExitBackCaptureUrl = session.ExitBackCaptureUrl;
            PaymentMethod = session.PaymentMethod;
            Cost = session.Cost;
            Status = session.Status;
            PaymentStatus = session.PaymentStatus;
        }
    }
}
