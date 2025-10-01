namespace SAPLSServer.DTOs.Concrete.ParkingSessionDtos
{
    public class CheckOutParkingSessionResponse
    {
        public string SessionId { get; set; } = null!;
        public string TransactionId { get; set; } = null!;
        public string PaymentMethod { get; set; } = null!;
    }
}
