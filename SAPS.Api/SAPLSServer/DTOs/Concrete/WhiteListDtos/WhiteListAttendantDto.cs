using SAPLSServer.DTOs.Base;
using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.WhiteListDtos
{
    public class WhiteListAttendantDto
    {
        public string ClientId { get; set; }
        public string ParkingLotId { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public DateTime AddedDate { get; set; }
        public DateTime? ExpiredDate { get; set; }

        public WhiteListAttendantDto(WhiteList whiteList)
        {
            ClientId = whiteList.ClientId;
            ParkingLotId = whiteList.ParkingLotId;
            Email = whiteList.Client.User.Email;
            FullName = whiteList.Client.User.FullName;
            AddedDate = whiteList.AddedAt;
            ExpiredDate = whiteList.ExpireAt;
        }
    }
}
