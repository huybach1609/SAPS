namespace SAPLSServer.Constants
{
    public static class ConfigurationConstants
    {
        // PayOS API keys
        public const string PayOsApiBaseUrl = "PayOSApi:BaseUrl";
        public const string PayOsApiKey = "PayOSApi:ApiKey";
        public const string PayOsClientKey = "PayOSApi:ClientKey";
        public const string PayOsCheckSumKey = "PayOSApi:CheckSumKey";

        public const string GeminiOcrBaseUrl = "GeminiApi:BaseUrl";
        public const string GeminiOcrModelName = "GeminiApi:Model";
        public const string GeminiOcrApiKey = "GeminiApi:ApiKey";

        public const string AzureKeyVaultVaultUrl = "AzureKeyVault:VaultUrl";
        public const string AzureKeyVaultTenantId = "AzureKeyVault:TenantId";
        public const string AzureKeyVaultClientId = "AzureKeyVault:ClientId";
        public const string AzureKeyVaultClientSecret = "AzureKeyVault:ClientSecret";

        public const string JwtIssuer = "JwtSettings:Issuer";
        public const string JwtAudience = "JwtSettings:Audience";
        public const string JwtSecretKey = "JwtSettings:SecretKey";

        public const string DefaultConnectionString = "DefaultConnection";
        public const string AzureConnectionString = "ConnectionStrings:AzureConnectionString";

        public const string EmailSmtpServer = "MailKitMailSettings:SmtpServer";
        public const string EmailSmtpPort = "MailKitMailSettings:SmtpPort";
        public const string EmailUsername = "MailKitMailSettings:Username";
        public const string EmailPassword = "MailKitMailSettings:Password";
        public const string EmailFromEmail = "MailKitMailSettings:FromEmail";
        public const string EmailFromName = "MailKitMailSettings:FromName";
        public const string EmailUseSsl = "MailKitMailSettings:UseSsl";

        public const string GoogleAuthClientId = "GoogleOAuth:ClientId";
        public const string GoogleAuthClientSecret = "GoogleOAuth:ClientSecret";

        public const string AzureBlobStorageAccountName = "AzureBlobStorage:AccountName";
        public const string AzureBlobStorageAccessKey = "AzureBlobStorage:AccessKey";
        public const string AzureBlobStorageConnectionString = "AzureBlobStorage:ConnectionString";
        public const string AzureBlobStorageDefaultContainer = "AzureBlobStorage:DefaultContainer";

        public const string FirebaseProjectId = "Firebase:ProjectId";
        public const string FirebaseServiceAccountJson = "Firebase:ServiceAccountJson";
        public const string FirebaseDatabaseUrl = "Firebase:DatabaseUrl";
        public const string FirebaseDefaultSound = "Firebase:DefaultSound";
        public const string FirebaseDefaultIcon = "Firebase:DefaultIcon";
    }
}
