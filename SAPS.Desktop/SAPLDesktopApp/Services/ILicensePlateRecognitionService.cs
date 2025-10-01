using Avalonia.Media.Imaging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    /// <summary>
    /// Service for license plate detection and recognition using AI models
    /// </summary>
    public interface ILicensePlateRecognitionService
    {
        /// <summary>
        /// Detect license plates in an image
        /// </summary>
        /// <param name="image">Input image containing potential license plates</param>
        /// <returns>List of detected license plate regions with bounding boxes</returns>
        Task<List<LicensePlateDetection>> DetectLicensePlatesAsync(Bitmap image);
        
        /// <summary>
        /// Extract text from a license plate image using OCR
        /// </summary>
        /// <param name="licensePlateImage">Cropped license plate image</param>
        /// <returns>Recognized text arranged in Vietnamese license plate format</returns>
        Task<string> RecognizeTextAsync(Bitmap licensePlateImage);
        
        /// <summary>
        /// Process a full image to detect and recognize license plates
        /// </summary>
        /// <param name="image">Input image</param>
        /// <returns>List of recognized license plate texts</returns>
        Task<List<string>> ProcessImageAsync(Bitmap image);
    }

    /// <summary>
    /// Represents a detected license plate with bounding box
    /// </summary>
    public class LicensePlateDetection
    {
        /// <summary>
        /// X coordinate of the top-left corner
        /// </summary>
        public int X { get; set; }
        
        /// <summary>
        /// Y coordinate of the top-left corner
        /// </summary>
        public int Y { get; set; }
        
        /// <summary>
        /// Width of the bounding box
        /// </summary>
        public int Width { get; set; }
        
        /// <summary>
        /// Height of the bounding box
        /// </summary>
        public int Height { get; set; }
        
        /// <summary>
        /// Confidence score of the detection (0.0 to 1.0)
        /// </summary>
        public float Confidence { get; set; }
        
        /// <summary>
        /// Cropped image of the detected license plate
        /// </summary>
        public Bitmap? CroppedImage { get; set; }
    }
}