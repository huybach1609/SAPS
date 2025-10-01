using SAPLSServer.Constants;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;

namespace SAPLSServer.Services.Implementations
{
    public class MailKitSettings : IMailSettings
    {
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly bool _useSsl;
        public MailKitSettings(IConfiguration configuration)
        {
            // Load email configuration from appsettings.json
            _smtpServer = configuration[ConfigurationConstants.EmailSmtpServer] ?? throw new EmptyConfigurationValueException();
            _smtpPort = configuration.GetValue<int>(ConfigurationConstants.EmailSmtpPort, 587);
            _smtpUsername = configuration[ConfigurationConstants.EmailUsername] ?? throw new EmptyConfigurationValueException();
            _smtpPassword = configuration[ConfigurationConstants.EmailPassword] ?? throw new EmptyConfigurationValueException();
            _fromEmail = configuration[ConfigurationConstants.EmailFromEmail] ?? _smtpUsername;
            _fromName = configuration[ConfigurationConstants.EmailFromName] ?? "Parking Lot Management System";
            _useSsl = configuration.GetValue<bool>(ConfigurationConstants.EmailUseSsl, true);
        }
        public string SmtpServer => _smtpServer;

        public int SmtpPort => _smtpPort;

        public string SmtpUsername => _smtpUsername;

        public string SmtpPassword => _smtpPassword;

        public string FromEmail => _fromEmail;

        public string FromName => _fromName;

        public bool UseSsl => _useSsl;
    }
}
