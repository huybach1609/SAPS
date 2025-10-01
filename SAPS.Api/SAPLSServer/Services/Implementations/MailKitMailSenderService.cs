using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using SAPLSServer.Constants;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;
using System.Text;

namespace SAPLSServer.Services.Implementations
{
    public class MailKitMailSenderService : IMailSenderService
    {
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly string _fromEmail;
        private readonly string _fromName;

        public MailKitMailSenderService(IMailSettings mailSettings)
        {
            // Load email configuration from appsettings.json using ConfigurationConstants
            _smtpServer = mailSettings.SmtpServer;
            _smtpPort = mailSettings.SmtpPort;
            _smtpUsername = mailSettings.SmtpUsername;
            _smtpPassword = mailSettings.SmtpPassword;
            _fromEmail = mailSettings.FromEmail;
            _fromName = mailSettings.FromName;
        }

        public async Task SendEmailAsync(
            string to,
            string subject,
            string body,
            bool isHtml = true,
            IDictionary<string, byte[]>? attachments = null)
        {
            if (string.IsNullOrWhiteSpace(to))
                throw new InvalidInformationException(MessageKeys.MESSAGE_RECEIVER_REQUIRED);

            if (string.IsNullOrWhiteSpace(subject))
                throw new InvalidInformationException(MessageKeys.MESSAGE_SUBJECT_REQUIRED);

            if (string.IsNullOrWhiteSpace(body))
                throw new InvalidInformationException(MessageKeys.MESSAGE_BODY_REQUIRED);

            try
            {
                var message = new MimeMessage();

                // Set sender
                message.From.Add(new MailboxAddress(_fromName, _fromEmail));

                // Set recipient(s) - handle multiple recipients separated by comma or semicolon
                var recipients = to.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries);
                foreach (var recipient in recipients)
                {
                    var trimmedRecipient = recipient.Trim();
                    if (!string.IsNullOrWhiteSpace(trimmedRecipient))
                    {
                        message.To.Add(MailboxAddress.Parse(trimmedRecipient));
                    }
                }

                message.Subject = subject;

                // CheckIn body builder
                var bodyBuilder = new BodyBuilder();

                if (isHtml)
                {
                    bodyBuilder.HtmlBody = body;
                    // CheckIn plain text version from HTML for better compatibility
                    bodyBuilder.TextBody = ConvertHtmlToPlainText(body);
                }
                else
                {
                    bodyBuilder.TextBody = body;
                }

                // Add attachments if provided
                if (attachments != null && attachments.Any())
                {
                    foreach (var attachment in attachments)
                    {
                        if (attachment.Value != null && attachment.Value.Length > 0)
                        {
                            await bodyBuilder.Attachments.AddAsync(
                                attachment.Key,
                                new MemoryStream(attachment.Value));
                        }
                    }
                }

                message.Body = bodyBuilder.ToMessageBody();

                // Send the email
                using var client = new SmtpClient();

                // Connect to SMTP server
                if (_smtpPort == 465)
                {
                    await client.ConnectAsync(_smtpServer, _smtpPort, SecureSocketOptions.SslOnConnect);
                }
                else if (_smtpPort == 587)
                {
                    await client.ConnectAsync(_smtpServer, _smtpPort, SecureSocketOptions.StartTls);
                }
                else
                {
                    await client.ConnectAsync(_smtpServer, _smtpPort, SecureSocketOptions.Auto);
                }

                // Authenticate
                await client.AuthenticateAsync(_smtpUsername, _smtpPassword);

                // Send message
                await client.SendAsync(message);

                // Disconnect
                await client.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to send email: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Converts HTML content to plain text for better email client compatibility
        /// </summary>
        private static string ConvertHtmlToPlainText(string html)
        {
            if (string.IsNullOrWhiteSpace(html))
                return string.Empty;

            // Simple HTML to text conversion
            // For more sophisticated conversion, consider using HtmlAgilityPack
            var text = html
                .Replace("<br>", "\n")
                .Replace("<br/>", "\n")
                .Replace("<br />", "\n")
                .Replace("</p>", "\n\n")
                .Replace("</div>", "\n")
                .Replace("</h1>", "\n\n")
                .Replace("</h2>", "\n\n")
                .Replace("</h3>", "\n\n")
                .Replace("</h4>", "\n\n")
                .Replace("</h5>", "\n\n")
                .Replace("</h6>", "\n\n");

            // Remove all HTML tags
            var sb = new StringBuilder();
            bool insideTag = false;

            foreach (char c in text)
            {
                if (c == '<')
                {
                    insideTag = true;
                    continue;
                }

                if (c == '>')
                {
                    insideTag = false;
                    continue;
                }

                if (!insideTag)
                {
                    sb.Append(c);
                }
            }

            return sb.ToString().Trim();
        }
    }
}
