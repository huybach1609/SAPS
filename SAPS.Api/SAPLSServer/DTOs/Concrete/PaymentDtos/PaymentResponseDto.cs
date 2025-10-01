using System.Text.Json.Serialization;

namespace SAPLSServer.DTOs.Concrete.PaymentDtos
{
    public class PaymentResponseDto
    {
        [JsonPropertyName("code")]
        public string Code { get; set; } = null!;

        [JsonPropertyName("desc")]
        public string Description { get; set; } = null!;

        [JsonPropertyName("data")]
        public PaymentDataDto? Data { get; set; }

        [JsonPropertyName("signature")]
        public string Signature { get; set; } = null!;
    }
}
