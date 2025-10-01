using SAPLSServer.DTOs.Concrete.PaymentDtos;
using System.Web;

namespace SAPLSServer.Helpers
{
    public static class PayOutDataToStringConverter
    {
        /// <summary>
        /// Convert PaymentWebhookData to sorted query string format for signature
        /// Following PayOS expected format but using our clean data model
        /// </summary>
        /// <param name="data">PaymentWebhookData to convert</param>
        /// <returns>Sorted query string for signature generation</returns>
        public static string ConvertToSignatureString(PaymentWebhookData data)
        {
            // Create a sorted dictionary of the data fields
            // Following the order that PayOS expects based on their documentation
            var signatureData = new SortedDictionary<string, string>();

            // Add fields in alphabetical order (PayOS requirement)
            if (!string.IsNullOrEmpty(data.AccountNumber))
                signatureData["accountNumber"] = data.AccountNumber;

            signatureData["amount"] = data.Amount.ToString();

            if (!string.IsNullOrEmpty(data.Code))
                signatureData["code"] = data.Code;

            if (!string.IsNullOrEmpty(data.CounterAccountBankId))
                signatureData["counterAccountBankId"] = data.CounterAccountBankId;

            if (!string.IsNullOrEmpty(data.CounterAccountBankName))
                signatureData["counterAccountBankName"] = data.CounterAccountBankName;

            if (!string.IsNullOrEmpty(data.CounterAccountName))
                signatureData["counterAccountName"] = data.CounterAccountName;

            if (!string.IsNullOrEmpty(data.CounterAccountNumber))
                signatureData["counterAccountNumber"] = data.CounterAccountNumber;

            if (!string.IsNullOrEmpty(data.Currency))
                signatureData["currency"] = data.Currency;

            if (!string.IsNullOrEmpty(data.Desc))
                signatureData["desc"] = data.Desc;

            if (!string.IsNullOrEmpty(data.Description))
                signatureData["description"] = data.Description;

            signatureData["orderCode"] = data.OrderCode.ToString();

            if (!string.IsNullOrEmpty(data.PaymentLinkId))
                signatureData["paymentLinkId"] = data.PaymentLinkId;

            if (!string.IsNullOrEmpty(data.Reference))
                signatureData["reference"] = data.Reference;

            if (!string.IsNullOrEmpty(data.TransactionDateTime))
                signatureData["transactionDateTime"] = data.TransactionDateTime;

            if (!string.IsNullOrEmpty(data.VirtualAccountName))
                signatureData["virtualAccountName"] = data.VirtualAccountName;

            if (!string.IsNullOrEmpty(data.VirtualAccountNumber))
                signatureData["virtualAccountNumber"] = data.VirtualAccountNumber;

            // Convert to query string format (URL encoded)
            var queryStringParts = signatureData
                .Select(kvp => $"{HttpUtility.UrlEncode(kvp.Key)}={HttpUtility.UrlEncode(kvp.Value)}")
                .ToArray();

            return string.Join("&", queryStringParts);
        }
    }
}
