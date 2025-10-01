using Avalonia.Media.Imaging;
using Compunet.YoloSharp;
using Compunet.YoloSharp.Data;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    public class LicensePlateRecognitionService : ILicensePlateRecognitionService, IDisposable
    {
        private readonly YoloPredictor _detectionPredictor;
        private readonly YoloPredictor _ocrPredictor;
        private readonly string _detectionModelPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "AIModels", "license_plate_recognition_model.onnx");
        private readonly string _ocrModelPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "AIModels", "license_plate_ocr_model.onnx");
        private bool _disposed = false;
        private const float MIN_CONFIDENCE_THRESHOLD = 0.6f;
        private const float ROW_SEPARATION_THRESHOLD = 40f; // Y-coordinate difference to consider different rows
        public LicensePlateRecognitionService()
        {
            try
            {
                // Initialize YOLO predictor for license plate detection
                _detectionPredictor = new YoloPredictor(_detectionModelPath);

                // Initialize YOLO predictor for character OCR/detection
                _ocrPredictor = new YoloPredictor(_ocrModelPath);

                System.Diagnostics.Debug.WriteLine("License plate recognition models loaded successfully");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading YOLO models: {ex.Message}");
                throw new InvalidOperationException($"Failed to load AI models: {ex.Message}", ex);
            }
        }
        public void SaveBitmapToFile(Bitmap bitmap)
        {
            var fileFolder = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "DetectedLicensePlates");
            if(!Directory.Exists(fileFolder))
                Directory.CreateDirectory(fileFolder); // Always ensure the directory exists

            var filePath = Path.Combine(fileFolder, $"{Guid.NewGuid()}.png");

            if (bitmap == null)
                throw new ArgumentNullException(nameof(bitmap));
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("File path must not be empty.", nameof(filePath));

            using var fileStream = File.Create(filePath); // File.Create will create or overwrite the file
            bitmap.Save(fileStream);
        }
        public async Task<List<LicensePlateDetection>> DetectLicensePlatesAsync(Bitmap image)
        {
            try
            {
                // Convert Bitmap to SixLabors.ImageSharp.Image for YOLO
                using var stream = new MemoryStream();
                image.Save(stream);
                stream.Position = 0;

                using var sharpImage = await Image.LoadAsync<Rgb24>(stream);

                // Run YOLO detection
                var detections = await _detectionPredictor.DetectAsync(sharpImage);

                var results = new List<LicensePlateDetection>();

                foreach (var detection in detections)
                {

                    // Only process detections above confidence threshold
                    if (detection.Confidence > 0.6f)
                    {
                        // Crop the detected license plate region
                        var croppedImage = CropBitmap(image,
                            (int)detection.Bounds.X,
                            (int)detection.Bounds.Y,
                            (int)detection.Bounds.Width,
                            (int)detection.Bounds.Height);
                        if (croppedImage != null)
                        {
                            SaveBitmapToFile(croppedImage);
                        }
                        results.Add(new LicensePlateDetection
                        {
                            X = (int)detection.Bounds.X,
                            Y = (int)detection.Bounds.Y,
                            Width = (int)detection.Bounds.Width,
                            Height = (int)detection.Bounds.Height,
                            Confidence = detection.Confidence,
                            CroppedImage = croppedImage
                        });
                    }
                }

                System.Diagnostics.Debug.WriteLine($"Detected {results.Count} license plates");
                return results;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in license plate detection: {ex.Message}");
                return new List<LicensePlateDetection>();
            }
        }

        public async Task<string> RecognizeTextAsync(Bitmap licensePlateImage)
        {
            try
            {
                // Convert Bitmap to SixLabors.ImageSharp.Image for YOLO
                using var stream = new MemoryStream();
                licensePlateImage.Save(stream);
                stream.Position = 0;

                using var sharpImage = await Image.LoadAsync<Rgb24>(stream);

                // Run YOLO OCR detection for individual characters
                var characterDetections = await _ocrPredictor.DetectAsync(sharpImage);

                // Convert detections to character data with positions
                var characters = GetCharactersFromDetections(characterDetections);

                return characters;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in OCR recognition: {ex.Message}");
                return string.Empty;
            }
        }

        public async Task<List<string>> ProcessImageAsync(Bitmap image)
        {
            var detections = await DetectLicensePlatesAsync(image);
            var results = new List<string>();

            foreach (var detection in detections.Where(d => d.CroppedImage != null))
            {
                var text = await RecognizeTextAsync(detection.CroppedImage!);
                if (!string.IsNullOrWhiteSpace(text))
                {
                    results.Add(text);
                }
            }

            return results;
        }

        private string GetCharactersFromDetections(YoloResult<Detection> detections)
        {
            try
            {
                // Filter confident detections
                var confidentCharacters = detections
                    .Where(d => d.Confidence > MIN_CONFIDENCE_THRESHOLD)
                    .ToList();

                if (confidentCharacters.Count < 8 || confidentCharacters.Count > 10)
                    return string.Empty;

                // Determine license plate type and structure
                var plateType = DetermineLicensePlateType(confidentCharacters);



                string plateReturn = plateType switch
                {
                    LicensePlateType.CarSingleRow => FormatSingleRowPlate(confidentCharacters),
                    LicensePlateType.MotorbikeOld9Char => FormatMotorbikeOld9Char(confidentCharacters),
                    LicensePlateType.MotorbikeNew8Char => FormatMotorbikeNew8Char(confidentCharacters),
                    LicensePlateType.CarDoubleRow => FormatCarDoubleRow(confidentCharacters),
                    LicensePlateType.MotorbikeElectric10Char => FormatMotorbikeElectric10Char(confidentCharacters),
                    LicensePlateType.Unknown => string.Empty,
                    _ => string.Empty
                };
                
                System.Diagnostics.Debug.WriteLine($"plate show: {plateReturn}");
                return plateReturn;
            }
            catch (Exception ex)
            {
                // Log exception and return empty string or partial result
                Console.WriteLine($"Error processing license plate: {ex.Message}");
                return string.Empty;
            }
        }

        private LicensePlateType DetermineLicensePlateType(List<Detection> detections)
        {
            var rows = GroupDetectionsIntoRows(detections);
            var totalChars = detections.Count;

            // Single row detection
            if (rows.Count == 1)
            {
                return totalChars >= 7 && totalChars <= 9
                    ? LicensePlateType.CarSingleRow
                    : LicensePlateType.Unknown;
            }

            // Two row detection
            if (rows.Count == 2)
            {
                return totalChars switch
                {
                    8 => LicensePlateType.MotorbikeNew8Char,
                    9 => LicensePlateType.MotorbikeOld9Char,
                    10 => HasElectricMotorbikePattern(detections)
                    ? LicensePlateType.MotorbikeElectric10Char
                    : LicensePlateType.Unknown,
                    7 or 8 when HasCarPattern(detections) => LicensePlateType.CarDoubleRow,
                    _ => LicensePlateType.Unknown
                };
            }

            return LicensePlateType.Unknown;
        }
        private bool HasElectricMotorbikePattern(List<Detection> detections)
        {
            // Electric motorbike plates typically have pattern: digits + letters + digit + dash + digits
            // Example: 36MD6-066.78
            var characters = detections
                .OrderBy(d => d.Bounds.Y)
                .ThenBy(d => d.Bounds.X)
                .Select(d => d.Name.Name.Trim())
                .ToList();

            if (characters.Count != 10) return false;

            // Check for electric motorbike pattern in first row
            // Should have: 2 digits + 2 letters + 1 digit (like 36MD6)
            var firstRowPattern = characters.Take(5).ToList();
            bool hasCorrectFirstRow = firstRowPattern.Count >= 3 &&
                                      char.IsDigit(firstRowPattern[0].FirstOrDefault()) &&
                                      char.IsDigit(firstRowPattern[1].FirstOrDefault()) &&
                                      char.IsLetter(firstRowPattern[2].FirstOrDefault());

            return hasCorrectFirstRow;
        }
        private List<List<Detection>> GroupDetectionsIntoRows(List<Detection> detections)
        {
            if (detections.Count == 0) return new List<List<Detection>>();

            var rows = new List<List<Detection>>();
            var sortedByY = detections.OrderBy(d => d.Bounds.Y).ToList();

            // Start with the first detection in the first row
            var currentRow = new List<Detection> { sortedByY[0] };
            float currentRowMaxY = sortedByY[0].Bounds.Y;

            for (int i = 1; i < sortedByY.Count; i++)
            {
                var currentDetection = sortedByY[i];
                float yGap = currentDetection.Bounds.Y - currentRowMaxY;

                // If gap is within threshold, add to current row
                if (yGap <= ROW_SEPARATION_THRESHOLD)
                {
                    currentRow.Add(currentDetection);
                    // Update the maximum Y of current row to track the bottom-most detection
                    currentRowMaxY = Math.Max(currentRowMaxY, currentDetection.Bounds.Y);
                }
                else
                {
                    // Gap is too large, finish current row and start new one
                    rows.Add(currentRow);
                    currentRow = new List<Detection> { currentDetection };
                    currentRowMaxY = currentDetection.Bounds.Y;
                }
            }

            // Add the last row
            if (currentRow.Count > 0)
            {
                rows.Add(currentRow);
            }

            // Sort each row by X coordinate (left to right)
            foreach (var row in rows)
            {
                row.Sort((a, b) => a.Bounds.X.CompareTo(b.Bounds.X));
            }

            return rows;
        }

        private bool HasCarPattern(List<Detection> detections)
        {
            // Car plates typically have pattern like: digits + letter(s) + dash + digits
            // This is a simplified check - can be enhanced based on actual character recognition
            var characters = detections
                .OrderBy(d => d.Bounds.Y)
                .ThenBy(d => d.Bounds.X)
                .Select(d => d.Name.Name.Trim())
                .ToList();

            // Look for patterns that suggest car plate vs motorbike
            var hasLettersBeforeMiddle = characters.Take(4).Any(c => char.IsLetter(c.FirstOrDefault()));
            var hasNumbersAtEnd = characters.Skip(characters.Count - 4).Any(c => char.IsDigit(c.FirstOrDefault()));

            return hasLettersBeforeMiddle && hasNumbersAtEnd;
        }

        private string FormatSingleRowPlate(List<Detection> detections)
        {
            // For single row car plates: 19A-45678
            var sortedChars = detections
                .OrderBy(d => d.Bounds.X)
                .Select(d => d.Name.Name.Trim())
                .Where(c => !string.IsNullOrWhiteSpace(c))
                .ToList();

            if (sortedChars.Count < 8) return string.Empty;

            var result = new StringBuilder();

            // First 2-3 characters (typically numbers + letter)
            for (int i = 0; i < Math.Min(3, sortedChars.Count); i++)
            {
                result.Append(sortedChars[i]);
                if (i == 2 || (i == 1 && char.IsLetter(sortedChars[i].FirstOrDefault())))
                {
                    result.Append('-');
                    break;
                }
            }
            int indexAfterDash = result.ToString().Count(c => c != '-');
            // Remaining characters (numbers)
            for (int i = indexAfterDash; i < sortedChars.Count; i++)
            {
                if(i == indexAfterDash + 3)
                    result.Append('.'); // Add dot after 3rd digit
                result.Append(sortedChars[i]);
            }
            if(result.Length != 10)
            {
                return string.Empty;
            }

            return result.ToString();
        }

        private string FormatMotorbikeOld9Char(List<Detection> detections)
        {
            // Format: 19AA-45678 (2 rows)
            var rows = GroupDetectionsIntoRows(detections);
            if (rows.Count != 2) return string.Empty;

            var firstRowChars = rows[0].Select(d => d.Name.Name.Trim()).Where(c => !string.IsNullOrWhiteSpace(c));
            var secondRowChars = rows[1].Select(d => d.Name.Name.Trim()).Where(c => !string.IsNullOrWhiteSpace(c));

            var result = new StringBuilder();

            // First row (typically 2 numbers + 2 letters)
            result.Append(string.Join("", firstRowChars));
            result.Append('-');

            // Second row (typically 5 numbers)
            var secondRowString = string.Join("", secondRowChars);
            if (secondRowString.Length > 3)
            {
                // Add dot after 3rd digit for motorbike format
                result.Append(secondRowString.Substring(0, 3));
                result.Append('.');
                result.Append(secondRowString.Substring(3));
            }
            else
            {
                result.Append(secondRowString);
            }
            if(result.Length != 11)
            {
                return string.Empty;
            }
            return result.ToString();
        }

        private string FormatMotorbikeNew8Char(List<Detection> detections)
        {
            // Format: 19AA-4567 (2 rows)
            var rows = GroupDetectionsIntoRows(detections);
            if (rows.Count != 2) return string.Empty;

            var firstRowChars = rows[0].Select(d => d.Name.Name.Trim()).Where(c => !string.IsNullOrWhiteSpace(c));
            var secondRowChars = rows[1].Select(d => d.Name.Name.Trim()).Where(c => !string.IsNullOrWhiteSpace(c));

            var result = new StringBuilder();

            // First row (typically 2 numbers + 2 letters)
            result.Append(string.Join("", firstRowChars));
            result.Append('-');

            // Second row (typically 4 numbers, no dot needed)
            result.Append(string.Join("", secondRowChars));
            if(result.Length != 9)
            {
                return string.Empty;
            }
            return result.ToString();
        }

        private string FormatMotorbikeElectric10Char(List<Detection> detections)
        {
            // Format: 36MD6-066.78 (2 rows, electric motorcycle)
            var rows = GroupDetectionsIntoRows(detections);
            if (rows.Count != 2) return string.Empty;

            var firstRowChars = rows[0].Select(d => d.Name.Name.Trim()).Where(c => !string.IsNullOrWhiteSpace(c));
            var secondRowChars = rows[1].Select(d => d.Name.Name.Trim()).Where(c => !string.IsNullOrWhiteSpace(c));

            var result = new StringBuilder();

            // First row (typically 2 digits + 2 letters + 1 digit, like 36MD6)
            result.Append(string.Join("", firstRowChars));
            result.Append('-');

            // Second row (typically 5 numbers with dot after 3rd digit, like 066.78)
            var secondRowString = string.Join("", secondRowChars);
            if (secondRowString.Length > 3)
            {
                // Add dot after 3rd digit for electric motorbike format
                result.Append(secondRowString.Substring(0, 3));
                result.Append('.');
                result.Append(secondRowString.Substring(3));
            }
            else
            {
                result.Append(secondRowString);
            }

            return result.ToString();
        }

        private string FormatCarDoubleRow(List<Detection> detections)
        {
            // Format: Car plate split across 2 rows (rare case)
            var rows = GroupDetectionsIntoRows(detections);
            if (rows.Count != 2) return string.Empty;

            var firstRowChars = rows[0].Select(d => d.Name.Name.Trim()).Where(c => !string.IsNullOrWhiteSpace(c));
            var secondRowChars = rows[1].Select(d => d.Name.Name.Trim()).Where(c => !string.IsNullOrWhiteSpace(c));

            var result = new StringBuilder();
            result.Append(string.Join("", firstRowChars));
            result.Append('-');

            // Format second row with dot after third digit
            var secondRowString = string.Join("", secondRowChars);
            if (secondRowString.Length > 3)
            {
                // Add dot after 3rd digit in the second row
                result.Append(secondRowString.Substring(0, 3));
                result.Append('.');
                result.Append(secondRowString.Substring(3));
            }
            else
            {
                result.Append(secondRowString);
            }

            if (result.Length != 10)
            {
                return string.Empty;
            }
            return result.ToString();
        }

        
        private Bitmap? CropBitmap(Bitmap source, int x, int y, int width, int height)
        {
            try
            {
                using var stream = new MemoryStream();
                source.Save(stream);
                stream.Position = 0;

                using var image = Image.Load<Rgba32>(stream);

                // Ensure coordinates are within image bounds
                x = Math.Max(0, Math.Min(x, image.Width - 1));
                y = Math.Max(0, Math.Min(y, image.Height - 1));
                width = Math.Max(1, Math.Min(width, image.Width - x));
                height = Math.Max(1, Math.Min(height, image.Height - y));

                // Ensure minimum size
                if (width < 10 || height < 5)
                {
                    System.Diagnostics.Debug.WriteLine("Crop region too small, skipping");
                    return null;
                }

                var cropRect = new Rectangle(x, y, width, height);
                using var croppedImage = image.Clone(ctx => ctx.Crop(cropRect));

                using var outputStream = new MemoryStream();
                croppedImage.SaveAsPng(outputStream);
                outputStream.Position = 0;

                return new Bitmap(outputStream);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error cropping bitmap: {ex.Message}");
                return null;
            }
        }

        public void Dispose()
        {
            if (_disposed) return;

            _detectionPredictor?.Dispose();
            _ocrPredictor?.Dispose();
            _disposed = true;

            System.Diagnostics.Debug.WriteLine("LicensePlateRecognitionService disposed");
        }
    }
    public enum LicensePlateType
    {
        Unknown,
        MotorbikeOld9Char,       // 19AA-45678 (2 rows)
        MotorbikeNew8Char,       // 19AA-4567 (2 rows) 
        MotorbikeElectric10Char, // 36MD6-066.78 (2 rows, electric motorcycle)
        CarSingleRow,            // 19A-45678 (1 row)
        CarDoubleRow             // 19A-45678 (2 rows, rare case)
    }
}