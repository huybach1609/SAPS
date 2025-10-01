using System;

namespace SAPLSServer.Exceptions
{
    /// <summary>
    /// Exception thrown when provided information is invalid for business logic reasons (e.g., duplicate unique fields).
    /// </summary>
    public class InvalidInformationException : Exception
    {
        public InvalidInformationException() { }

        public InvalidInformationException(string message) : base(message) { }

        public InvalidInformationException(string message, Exception innerException) : base(message, innerException) { }
    }
}