namespace SAPLSServer.Exceptions
{
    public class NullValueDataException : Exception
    {
        public NullValueDataException() { }
        public NullValueDataException(string message) : base(message) { }
        public NullValueDataException(string message, Exception inner) : base(message, inner) { }
    }
}
