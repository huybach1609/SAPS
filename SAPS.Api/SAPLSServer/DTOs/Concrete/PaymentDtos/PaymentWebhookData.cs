using Newtonsoft.Json;

namespace SAPLSServer.DTOs.Concrete.PaymentDtos
{
    public class PaymentWebhookData
    {
        [JsonProperty("orderCode")]
        public int OrderCode { get; set; }

        [JsonProperty("amount")]
        public int Amount { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; } = null!;

        [JsonProperty("accountNumber")]
        public string AccountNumber { get; set; } = null!;

        [JsonProperty("reference")]
        public string Reference { get; set; } = null!;

        [JsonProperty("transactionDateTime")]
        public string TransactionDateTime { get; set; } = null!;

        [JsonProperty("currency")]
        public string Currency { get; set; } = null!;

        [JsonProperty("paymentLinkId")]
        public string PaymentLinkId { get; set; } = null!;

        [JsonProperty("code")]
        public string Code { get; set; } = null!;

        [JsonProperty("desc")]
        public string Desc { get; set; } = null!;

        [JsonProperty("counterAccountBankId")]
        public string? CounterAccountBankId { get; set; }

        [JsonProperty("counterAccountBankName")]
        public string? CounterAccountBankName { get; set; }

        [JsonProperty("counterAccountName")]
        public string? CounterAccountName { get; set; }

        [JsonProperty("counterAccountNumber")]
        public string? CounterAccountNumber { get; set; }

        [JsonProperty("virtualAccountName")]
        public string? VirtualAccountName { get; set; }

        [JsonProperty("virtualAccountNumber")]
        public string? VirtualAccountNumber { get; set; }
    }
}
