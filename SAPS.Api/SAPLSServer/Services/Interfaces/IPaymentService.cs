using SAPLSServer.DTOs.Concrete.PaymentDtos;

namespace SAPLSServer.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<PaymentResponseDto?> SendPaymentRequest(PaymentRequestDto request, string clientKey, 
            string apiKey, string checkSumKey);
        Task<PaymentStatusResponseDto?> SendCancelPaymentRequest(int paymentId, string clientKey, 
            string apiKey, PaymentCancelRequestDto request);
        Task<PaymentStatusResponseDto?> GetPaymentStatus(int paymentId, string clientKey, string apiKey);
        string GenerateSignature(string data, string checkSumKey);
    }
}
