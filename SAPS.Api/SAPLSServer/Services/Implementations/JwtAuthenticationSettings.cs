using SAPLSServer.Constants;
using SAPLSServer.Exceptions;
using SAPLSServer.Services.Interfaces;

namespace SAPLSServer.Services.Implementations
{
    public class JwtAuthenticationSettings : IAuthenticationSettings
    {
        private readonly string _issuer;
        private readonly string _audience;
        private readonly string _secretKey;
        public JwtAuthenticationSettings(IConfiguration configuration)
        {
            _issuer = configuration[ConfigurationConstants.JwtIssuer] ?? throw new EmptyConfigurationValueException();
            _audience = configuration[ConfigurationConstants.JwtAudience] ?? throw new EmptyConfigurationValueException();
            _secretKey = configuration[ConfigurationConstants.JwtSecretKey] ?? throw new EmptyConfigurationValueException();
        }
        public string JwtIssuer => _issuer;

        public string JwtAudience => _audience;

        public string JwtSecretKey => _secretKey;
    }
}
