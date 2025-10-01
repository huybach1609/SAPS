using System.Runtime.Serialization;

namespace SAPLSServer.Exceptions
{
    public class ParkingSessionException : Exception
    {
        public ParkingSessionException()
        {
        }

        public ParkingSessionException(string? message) : base(message)
        {
        }

        public ParkingSessionException(string? message, Exception? innerException) : base(message, innerException)
        {
        }
    }
}
