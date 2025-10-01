
namespace SAPLDesktopApp.DTOs.Concrete.ShiftDiaryDtos
{
    public class CreateShiftDiaryRequest
    {
        public string Header { get; set; } = null!;
        public string Body { get; set; } = null!;
        public string ParkingLotId { get; set; } = null!;
    }
}
