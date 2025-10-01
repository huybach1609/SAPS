namespace SAPLDesktopApp.DTOs.Base
{
    public abstract class GetListRequest
    {
        public string? Order { get; set; } 
        public string? SortBy { get; set; }
        public string? SearchCriteria { get; set; }
    }
}