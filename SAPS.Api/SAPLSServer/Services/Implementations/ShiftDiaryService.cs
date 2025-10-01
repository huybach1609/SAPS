using System.ComponentModel.DataAnnotations;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.ShiftDiaryDtos;
using SAPLSServer.DTOs.PaginationDto;
using SAPLSServer.Exceptions;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using SAPLSServer.Services.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Services.Implementations
{
    public class ShiftDiaryService : IShiftDiaryService
    {
        private readonly IShiftDiaryRepository _shiftDiaryRepository;
        private readonly IParkingLotService _parkingLotService;

        public ShiftDiaryService(IShiftDiaryRepository shiftDiaryRepository, IParkingLotService parkingLotService)
        {
            _shiftDiaryRepository = shiftDiaryRepository;
            _parkingLotService = parkingLotService;
        }

        public async Task<ShiftDiaryDetailsDto> CreateAsync(CreateShiftDiaryRequest request, string senderId)
        {
            if(!await _parkingLotService.IsParkingLotValid(request.ParkingLotId))
            {
                throw new InvalidInformationException(MessageKeys.PARKING_LOT_NOT_FOUND);
            }
            if(!await _parkingLotService.IsParkingLotStaff(request.ParkingLotId, senderId))
            {
                throw new UnauthorizedAccessException(MessageKeys.UNAUTHORIZED_ACCESS);
            }
            var diary = new ShiftDiary
            {
                Id = Guid.NewGuid().ToString(),
                Header = request.Header,
                Body = request.Body,
                ParkingLotId = request.ParkingLotId,
                SenderId = senderId,
                CreatedAt = DateTime.UtcNow
            };
            await _shiftDiaryRepository.AddAsync(diary);
            await _shiftDiaryRepository.SaveChangesAsync();
            var created = await _shiftDiaryRepository.FindIncludingSenderReadOnly(diary.Id)
                         ?? throw new InvalidInformationException("Failed to create shift diary.");
            return new ShiftDiaryDetailsDto(created);
        }

        public async Task<List<ShiftDiarySummaryDto>> GetListAsync(GetShiftDiaryListRequest request)
        {
            var filters = BuildShiftDiaryCriterias(request);
            var sortBy = GetSortByExpression(request.SortBy);
            var isAscending = IsAscending(request.Order);

            var diaries = await _shiftDiaryRepository.GetAllAsync(filters.ToArray(), sortBy, isAscending);
            var result = new List<ShiftDiarySummaryDto>();
            foreach (var diary in diaries)
            {
                var diaryIncludingSender = await _shiftDiaryRepository.FindIncludingSenderReadOnly(diary.Id);
                if (diaryIncludingSender != null)
                {
                    result.Add(new ShiftDiarySummaryDto(diaryIncludingSender));
                }
            }
            return result;
        }

        public async Task<PageResult<ShiftDiarySummaryDto>> GetPageAsync(PageRequest pageRequest, GetShiftDiaryListRequest request)
        {            
            var filters = BuildShiftDiaryCriterias(request);
            var sortBy = GetSortByExpression(request.SortBy);
            var isAscending = IsAscending(request.Order);

            var diaries = await _shiftDiaryRepository.GetPageAsync(
                pageRequest.PageNumber,
                pageRequest.PageSize,
                filters.ToArray(),
                sortBy,
                isAscending
            );
            var total = await _shiftDiaryRepository.CountAsync(filters.ToArray());
            var items = new List<ShiftDiarySummaryDto>();
            foreach ( var diary in diaries)
            {
                var diaryIncludingSender = await _shiftDiaryRepository.FindIncludingSenderReadOnly(diary.Id);
                if (diaryIncludingSender != null)
                {
                    items.Add(new ShiftDiarySummaryDto(diaryIncludingSender));
                }
            }
            return new PageResult<ShiftDiarySummaryDto>
            {
                Items = items,
                TotalCount = total,
                PageNumber = pageRequest.PageNumber,
                PageSize = pageRequest.PageSize
            };
        }

        public async Task<ShiftDiaryDetailsDto?> GetDetailsAsync(string id)
        {
            var diary = await _shiftDiaryRepository.FindIncludingSenderReadOnly(id);
            return diary == null ? null : new ShiftDiaryDetailsDto(diary);
        }

        #region Private Helper Methods

        private static List<Expression<Func<ShiftDiary, bool>>> BuildShiftDiaryCriterias(GetShiftDiaryListRequest request)
        {
            var filters = new List<Expression<Func<ShiftDiary, bool>>>();
            
            if (!string.IsNullOrEmpty(request.ParkingLotId))
                filters.Add(d => d.ParkingLotId == request.ParkingLotId);
            
            if (request.UploadedDate.HasValue)
                filters.Add(d => d.CreatedAt.Date == request.UploadedDate.Value.ToDateTime(TimeOnly.MinValue).Date);

            // Filter by search criteria (search in header and body)
            if (!string.IsNullOrWhiteSpace(request.SearchCriteria))
            {
                filters.Add(d => d.Header.Contains(request.SearchCriteria) ||
                                d.Body.Contains(request.SearchCriteria));
            }

            return filters;
        }

        private static Expression<Func<ShiftDiary, object>> GetSortByExpression(string? sortBy)
        {
            if (string.IsNullOrWhiteSpace(sortBy))
                return d => d.CreatedAt;

            switch (sortBy.Trim().ToLower())
            {
                case "createdat":
                    return d => d.CreatedAt;
                case "header":
                    return d => d.Header;
                case "body":
                    return d => d.Body;
                case "parkinglotid":
                    return d => d.ParkingLotId;
                default:
                    return d => d.CreatedAt;
            }
        }

        private static bool IsAscending(string? order)
        {
            return string.Equals(order, OrderType.Asc.ToString(), StringComparison.OrdinalIgnoreCase);
        }

        #endregion
    }
}