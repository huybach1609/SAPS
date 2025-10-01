using SAPLSServer.Models;

namespace SAPLSServer.DTOs.Concrete.UserDtos
{
    public class ParkingLotOwnerProfileDetailsDto : UserDetailsDto
    {
        public string ParkingLotOwnerId { get; set; }
        public string ClientKey { get; set; }
        public string ApiKey { get; set; }
        public string CheckSumKey { get; set; }
        public ParkingLotOwnerProfileDetailsDto(ParkingLotOwnerProfile parkingLotOwner) 
            : base(parkingLotOwner.User)
        {
            ParkingLotOwnerId = parkingLotOwner.ParkingLotOwnerId;
            ClientKey = parkingLotOwner.ClientKey ?? string.Empty;
            ApiKey = parkingLotOwner.ApiKey ?? string.Empty;
            CheckSumKey = parkingLotOwner.CheckSumKey ?? string.Empty;
        }
    }
}
