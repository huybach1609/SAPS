namespace SAPLSServer.Services.Interfaces
{
    public interface IVehicleShareCodeService
    {
        string GenerateShareCode(int codeLength);
    }
}
