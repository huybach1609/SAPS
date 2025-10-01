namespace SAPLSServer.Services.Interfaces
{
    public interface IAuthenticationSettings
    {
        /// <summary>
        /// Gets the JWT issuer, which is typically the authority that issues the JWT tokens.
        /// </summary>
        string JwtIssuer { get; }
        /// <summary>
        /// 
        /// </summary>
        string JwtAudience { get; }
        /// <summary>
        /// 
        /// </summary>
        string JwtSecretKey { get; }
    }
}
