namespace SAPLDesktopApp.DTOs.Concrete.ParkingSessionDtos
{
    public class GetParkingSessionListByParkingLotIdRequest : GetOwnedParkingSessionListRequest
    {
        public string ParkingLotId { get; set; } = string.Empty;
    }
}
