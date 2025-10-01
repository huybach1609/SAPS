using SAPLSServer.DTOs.Base;

namespace SAPLSServer.DTOs.Concrete.OcrDtos
{
    public class CitizenIdOcrResponse
    {
        public string? CitizenId { get; set; }
        public string? FullName { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string? Sex { get; set; }
        public string? Nationality { get; set; }
        public string? PlaceOfOrigin { get; set; }
        public string? PlaceOfResidence { get; set; }
        public DateOnly? ExpiryDate { get; set; }
    }
}

