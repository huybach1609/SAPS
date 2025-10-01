using System.Text.Json.Serialization;

namespace SAPLSServer.DTOs.Concrete.PaymentDtos
{
    public class PaymentRequestDto
    {
        [JsonPropertyName("orderCode")]
        public int OrderCode { get; set; }

        [JsonPropertyName("amount")]
        public int Amount { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; } = null!;

        [JsonPropertyName("cancelUrl")]
        public string CancelUrl { get; set; } = null!;

        [JsonPropertyName("returnUrl")]
        public string ReturnUrl { get; set; } = null!;

        [JsonPropertyName("signature")]
        public string Signature { get; set; } = null!;

        // Optional fields
        [JsonPropertyName("buyerName")]
        public string? BuyerName { get; set; }

        [JsonPropertyName("buyerEmail")]
        public string? BuyerEmail { get; set; }

        [JsonPropertyName("buyerPhone")]
        public string? BuyerPhone { get; set; }

        [JsonPropertyName("buyerAddress")]
        public string? BuyerAddress { get; set; }

        [JsonPropertyName("expiredAt")]
        public int? ExpiredAt { get; set; }

        [JsonPropertyName("items")]
        public List<PaymentItemDto>? Items { get; set; }
    }
}
