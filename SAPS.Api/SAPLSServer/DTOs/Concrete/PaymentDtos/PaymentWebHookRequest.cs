using Newtonsoft.Json;

namespace SAPLSServer.DTOs.Concrete.PaymentDtos
{
    public class PaymentWebHookRequest
    {
        [JsonProperty("code")]
        public string Code { get; set; } = null!;

        [JsonProperty("desc")]
        public string Desc { get; set; } = null!;

        [JsonProperty("success")]
        public bool Success { get; set; }

        [JsonProperty("data")]
        public PaymentWebhookData Data { get; set; } = null!;

        [JsonProperty("signature")]
        public string Signature { get; set; } = null!;
    }
}
