using SAPLSServer.Services.Implementations;
using SAPLSServer.Services.Interfaces;
namespace SAPLSServer.Services.Implementations
{
    public class GeminiModelPromptProviderService : IPromptProviderService
    {
        private readonly string _citizenCardPrompt;
        private readonly string _vehicleRegistrationPrompt;

        public GeminiModelPromptProviderService(IWebHostEnvironment environment)
        {
            var promptsPath = Path.Combine(environment.ContentRootPath, "Resources", "Prompts");

            // Read citizen card prompt
            var citizenCardPath = Path.Combine(promptsPath, "CitizenCardExtractPrompt.txt");
            _citizenCardPrompt = File.Exists(citizenCardPath)
                ? File.ReadAllText(citizenCardPath)
                : string.Empty;

            // Read vehicle registration prompt
            var vehicleRegistrationPath = Path.Combine(promptsPath, "VehicleRegistrationCertificateExtractPrompt.txt");
            _vehicleRegistrationPrompt = File.Exists(vehicleRegistrationPath)
                ? File.ReadAllText(vehicleRegistrationPath)
                : string.Empty;
        }

        public string CitizenCardPrompt => _citizenCardPrompt;
        public string VehicleRegistrationPrompt => _vehicleRegistrationPrompt;
    }
}