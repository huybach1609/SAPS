namespace SAPLSServer.Services.Interfaces
{
    public interface IAzureBlobStorageSettings
    {
        string AccountName { get; }
        string AccessKey { get; }
        string ConnectionString { get; }
        string DefaultContainer { get; }
    }
}