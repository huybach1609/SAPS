namespace SAPLDesktopApp.Dtos.PaymentDtos
{
    public class PaymentResponseDto
    {
        public string Code { get; set; } = null!;

        public string Description { get; set; } = null!;

        public PaymentDataDto? Data { get; set; }

        public string Signature { get; set; } = null!;
    }
}
