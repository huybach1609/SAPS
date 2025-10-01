using System.Security.Cryptography;
using System.Text;
using SAPLSServer.Services.Interfaces;

namespace SAPLSServer.Services.Implementations
{
    public class VehicleShareCodeService : IVehicleShareCodeService
    {
        public const int VEHICLE_SHARE_CODE_LENGTH = 8;

        public string GenerateShareCode(int codeLength)
        {
            const string allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~";
            var shareCode = new StringBuilder(codeLength);
            using var rng = RandomNumberGenerator.Create();
            var buffer = new byte[128];

            while (shareCode.Length < codeLength)
            {
                rng.GetBytes(buffer);
                foreach (var b in buffer)
                {
                    var index = b % allowedChars.Length;
                    shareCode.Append(allowedChars[index]);
                    if (shareCode.Length == codeLength)
                        break;
                }
            }

            return shareCode.ToString();
        }
    }
}
