using System.Text.Json.Serialization;

namespace SAPLSServer.DTOs.Concrete.PaymentDtos
{
    public class PaymentTransactionDto
    {
        [JsonPropertyName("reference")]
        public string Reference { get; set; } = null!;

        [JsonPropertyName("amount")]
        public int Amount { get; set; }

        [JsonPropertyName("accountNumber")]
        public string AccountNumber { get; set; } = null!;

        [JsonPropertyName("description")]
        public string Description { get; set; } = null!;

        [JsonPropertyName("transactionDateTime")]
        public string TransactionDateTime { get; set; } = null!;

        [JsonPropertyName("virtualAccountName")]
        public string VirtualAccountName { get; set; } = null!;

        [JsonPropertyName("virtualAccountNumber")]
        public string? VirtualAccountNumber { get; set; }

        [JsonPropertyName("counterAccountBankId")]
        public string? CounterAccountBankId { get; set; }

        [JsonPropertyName("counterAccountBankName")]
        public string? CounterAccountBankName { get; set; }

        [JsonPropertyName("counterAccountName")]
        public string? CounterAccountName { get; set; }

        [JsonPropertyName("counterAccountNumber")]
        public string? CounterAccountNumber { get; set; }
    }
}
