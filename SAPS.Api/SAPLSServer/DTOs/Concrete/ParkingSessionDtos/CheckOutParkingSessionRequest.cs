using SAPLSServer.Constants;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Concrete.ParkingSessionDtos
{
    /// <summary>
    /// Represents the data required to check out a parking session.
    /// </summary>
    public class CheckOutParkingSessionRequest
    {
        /// <summary>
        /// The ID of the parking session to check out.
        /// </summary>
        public string SessionId { get; set; } = null!;

        /// <summary>
        /// The payment method used for the session.
        /// </summary>
        [EnumDataType(typeof(PaymentMethod), ErrorMessage = MessageKeys.INVALID_PAYMENT_METHOD)]
        public string PaymentMethod { get; set; } = null!;
    }
}