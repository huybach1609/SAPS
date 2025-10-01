using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.UserDtos
{
    public class ClientProfileSummaryDto : UserSummaryDto
    {
        public string CitizenId { get; set; }
        public DateOnly DateOfBirth { get; set; }
        public bool Sex { get; set; }
        public string Nationality { get; set; }
        public string PlaceOfOrigin { get; set; }
        public string PlaceOfResidence { get; set; }
        public ClientProfileSummaryDto(ClientProfile model) : base(model.User)
        {
            CitizenId = model.CitizenId;
            DateOfBirth = model.DateOfBirth;
            Sex = model.Sex;
            Nationality = model.Nationality;
            PlaceOfOrigin = model.PlaceOfOrigin;
            PlaceOfResidence = model.PlaceOfResidence;
        }
    }
}
