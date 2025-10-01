namespace SAPLSServer.Exceptions
{
    public class InvalidMediaException : Exception
    {
        public InvalidMediaException() { }
        public InvalidMediaException(string message) : base(message) { }
        public InvalidMediaException(string message, Exception innerException) : base(message, innerException){ }
    }
}
