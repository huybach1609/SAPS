namespace SAPLSServer.Services.Interfaces
{
    public interface IMailSenderService
    {
        /// <summary>
        /// Sends an email asynchronously.
        /// </summary>
        /// <param name="to">Recipient email address.</param>
        /// <param name="subject">Email subject.</param>
        /// <param name="body">Email body (HTML or plain text).</param>
        /// <param name="isHtml">Indicates if the body is HTML.</param>
        /// <param name="attachments">Optional file attachments (filename, byte[]).</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task SendEmailAsync(
            string to,
            string subject,
            string body,
            bool isHtml = true,
            IDictionary<string, byte[]>? attachments = null
        );
    }
}
