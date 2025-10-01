using System.Text.Json.Serialization;

namespace SAPLSServer.DTOs.Concrete.PaymentDtos
{
    public class PaymentDataDto
    {
        [JsonPropertyName("bin")]
        public string Bin { get; set; } = null!;

        [JsonPropertyName("accountNumber")]
        public string AccountNumber { get; set; } = null!;

        [JsonPropertyName("accountName")]
        public string AccountName { get; set; } = null!;

        [JsonPropertyName("amount")]
        public int Amount { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; } = null!;

        [JsonPropertyName("orderCode")]
        public int OrderCode { get; set; }

        [JsonPropertyName("currency")]
        public string Currency { get; set; } = null!;

        [JsonPropertyName("paymentLinkId")]
        public string PaymentLinkId { get; set; } = null!;

        [JsonPropertyName("status")]
        public string Status { get; set; } = null!;

        [JsonPropertyName("checkoutUrl")]
        public string CheckoutUrl { get; set; } = null!;

        [JsonPropertyName("qrCode")]
        public string QrCode { get; set; } = null!;
    }
}
