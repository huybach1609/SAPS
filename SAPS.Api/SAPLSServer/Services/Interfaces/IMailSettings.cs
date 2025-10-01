namespace SAPLSServer.Services.Interfaces
{
    public interface IMailSettings
    {
        /// <summary>
        /// SMTP server address.
        /// </summary>
        string SmtpServer { get; }
        /// <summary>
        /// SMTP server port.
        /// </summary>
        int SmtpPort { get; }
        /// <summary>
        /// SMTP username for authentication.
        /// </summary>
        string SmtpUsername { get; }
        /// <summary>
        /// SMTP password for authentication.
        /// </summary>
        string SmtpPassword { get; }
        /// <summary>
        /// Email address to use as the sender.
        /// </summary>
        string FromEmail { get; }
        /// <summary>
        /// Name to use as the sender in the email.
        /// </summary>
        string FromName { get; }
        /// <summary>
        /// Specifies whether to use SSL for the SMTP connection.
        /// </summary>
        bool UseSsl { get; }
    }
}
