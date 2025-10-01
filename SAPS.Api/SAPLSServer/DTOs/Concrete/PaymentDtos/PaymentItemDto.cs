using System.Text.Json.Serialization;

namespace SAPLSServer.DTOs.Concrete.PaymentDtos
{
    public class PaymentItemDto
    {
        [JsonPropertyName("name")]
        public string? Name { get; set; }
        [JsonPropertyName("quantity")]
        public int Quantity { get; set; }
        [JsonPropertyName("price")]
        public int Price { get; set; }
    }
}
