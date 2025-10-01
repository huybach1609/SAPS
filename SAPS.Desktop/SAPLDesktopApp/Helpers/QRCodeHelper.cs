using QRCoder;

namespace SAPLDesktopApp.Helpers
{
    public static class QRCodeHelper
    {
        public static byte[]? GenerateQRImage(string plainQRCode)
        {
            QRCodeGenerator qrGenerator = new();
            var qrCodeData = qrGenerator.CreateQrCode(plainQRCode, QRCodeGenerator.ECCLevel.Q);
            var qrCode = new BitmapByteQRCode(qrCodeData);
            var qrCodeImage = qrCode.GetGraphic(20);
            return qrCodeImage;
        }
    }
}