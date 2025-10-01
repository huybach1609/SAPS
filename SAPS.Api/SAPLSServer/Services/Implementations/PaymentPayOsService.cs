using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.PaymentDtos;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using static SAPLSServer.Constants.APIPaths;

namespace SAPLSServer.Services.Implementations
{
    public class PaymentPayOsService : IPaymentService
    {
        private readonly IHttpClientService _clientService;

        private readonly string _baseUrl;
        public PaymentPayOsService(IHttpClientService clientService, IConfiguration configuration)
        {
            _clientService = clientService;
            _baseUrl = configuration[ConfigurationConstants.PayOsApiBaseUrl]
                ?? throw new EmptyConfigurationValueException();
        }

        public async Task<PaymentStatusResponseDto?> SendCancelPaymentRequest(int paymentId, string clientKey, 
            string apiKey, PaymentCancelRequestDto request)
        {
            string cancelPaymentStatusUrl = $"{_baseUrl}{UrlPaths.PAYMENT_REQUEST_PATH}/{paymentId}{UrlPaths.PAYMENT_CANCEL_PATH}";
            var headers = new Dictionary<string, string>
            {
                {
                    HeaderKeys.PAYOS_CLIENT_HEADER, clientKey
                },
                {
                    HeaderKeys.PAYOS_API_KEY_HEADER, apiKey
                }
            };
            var requestBody = JsonSerializer.Serialize(request);
            var response = await _clientService.PostAsync(cancelPaymentStatusUrl, requestBody, headers);
            if( string.IsNullOrWhiteSpace(response))
            {
                throw new InvalidOperationException(MessageKeys.PAYOS_SERVICE_UNAVAILABLE);
            }
            var paymentStatusResponse = JsonSerializer.Deserialize<PaymentStatusResponseDto>(response);
            return paymentStatusResponse;
        }
        public async Task<PaymentStatusResponseDto?> GetPaymentStatus(int paymentId, string clientKey, string apiKey)
        {
            string getPaymentStatusUrl = $"{_baseUrl}{UrlPaths.PAYMENT_REQUEST_PATH}/{paymentId}";
            var headers = new Dictionary<string, string>
            {
                {
                    HeaderKeys.PAYOS_CLIENT_HEADER, clientKey
                },
                {
                    HeaderKeys.PAYOS_API_KEY_HEADER, apiKey
                }
            };
            var response = await _clientService.GetAsync(getPaymentStatusUrl, headers);
            if (string.IsNullOrWhiteSpace(response))
            {
                throw new InvalidOperationException(MessageKeys.PAYOS_SERVICE_UNAVAILABLE);
            }
            var paymentStatusResponse = JsonSerializer.Deserialize<PaymentStatusResponseDto>(response);
            return paymentStatusResponse;
        }

        public async Task<PaymentResponseDto?> SendPaymentRequest(PaymentRequestDto request,
            string clientKey, string apiKey, string checkSumKey)
        {
            string postPaymentStatusUrl = $"{_baseUrl}{UrlPaths.PAYMENT_REQUEST_PATH}";
            var headers = new Dictionary<string, string>
            {
                {
                    HeaderKeys.PAYOS_CLIENT_HEADER, clientKey
                },
                {
                    HeaderKeys.PAYOS_API_KEY_HEADER, apiKey
                }
            };
            
            var requestBody = JsonSerializer.Serialize(request);

            var response = await _clientService.PostAsync(postPaymentStatusUrl, requestBody, headers);
            if (string.IsNullOrWhiteSpace(response))
            {
                throw new InvalidOperationException(MessageKeys.PAYOS_SERVICE_UNAVAILABLE);
            }
            var paymentStatusResponse = JsonSerializer.Deserialize<PaymentResponseDto>(response);
            return paymentStatusResponse;

        }
        public string GenerateSignature(string data, string checkSumKey)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(checkSumKey));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));

            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        }
    }
}
