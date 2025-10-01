namespace SAPLSServer.Services.Interfaces
{
    public interface IPromptProviderService
    {
        string CitizenCardPrompt { get; }
        string VehicleRegistrationPrompt { get; }
    }
}
