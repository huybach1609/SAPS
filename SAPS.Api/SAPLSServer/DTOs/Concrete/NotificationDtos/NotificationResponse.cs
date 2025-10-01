namespace SAPLSServer.DTOs.Concrete.NotificationDtos
{
    public class NotificationResponse
    {
        public bool IsSuccess { get; set; }
        public string? MessageId { get; set; }
        public string? ErrorMessage { get; set; }
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
        public List<string> FailedTokens { get; set; } = new();
    }
}