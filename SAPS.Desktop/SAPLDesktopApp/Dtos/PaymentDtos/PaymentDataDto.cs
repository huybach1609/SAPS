namespace SAPLDesktopApp.Dtos.PaymentDtos
{
    public class PaymentDataDto
    {
        public string Bin { get; set; } = null!;

        public string AccountNumber { get; set; } = null!;

        public string AccountName { get; set; } = null!;

        public int Amount { get; set; }

        public string Description { get; set; } = null!;

        public int OrderCode { get; set; }

        public string Currency { get; set; } = null!;

        public string PaymentLinkId { get; set; } = null!;

        public string Status { get; set; } = null!;

        public string CheckoutUrl { get; set; } = null!;

        public string QrCode { get; set; } = null!;
    }
    
}
