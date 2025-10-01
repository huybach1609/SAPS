namespace SAPLSServer.DTOs.PaginationDto
{
    public class PageResult<T> where T : class
    {
        /// <summary>
        /// Represents a paginated result set.
        /// </summary>
        public List<T> Items { get; set; } = new();
        /// <summary>
        /// Total number of items across all pages.
        /// </summary>
        public int TotalCount { get; set; }
        /// <summary>
        /// Current page number.
        /// </summary>
        public int PageNumber { get; set; }
        /// <summary>
        /// Size of each page.
        /// </summary>
        public int PageSize { get; set; }
        /// <summary>
        /// Total number of pages.
        /// </summary>
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        /// <summary>
        /// Indicates if there is a previous page.
        /// </summary>
        public bool HasPreviousPage => PageNumber > 1;
        /// <summary>
        /// Indicates if there is a next page.
        /// </summary>
        public bool HasNextPage => PageNumber < TotalPages;
    }
}
