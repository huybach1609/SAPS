using SAPLSServer.DTOs.Concrete.ParkingLotDtos;
using SAPLSServer.DTOs.Concrete.PaymentDtos;
using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.ParkingSessionDtos
{
    public class ParkingSessionDetailsForClientDto : ParkingSessionSummaryForClientDto
    {
        public ParkingLotSummaryDto? ParkingLot { get; set; }
        public PaymentResponseDto? PaymentInformation { get; set; }
        public ParkingSessionDetailsForClientDto(ParkingSession session) 
            : base(session)
        {
            if(session.ParkingLot != null)
                ParkingLot = new ParkingLotSummaryDto(session.ParkingLot);

        }
    }
}
