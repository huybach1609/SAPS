using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.WhiteListDtos;
using SAPLSServer.DTOs.PaginationDto;
using SAPLSServer.Exceptions;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using SAPLSServer.Services.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Services.Implementations
{
    public class WhiteListService : IWhiteListService
    {
        private readonly IWhiteListRepository _whiteListRepository;
        private readonly IParkingLotService _parkingLotService;

        public WhiteListService(IWhiteListRepository whiteListRepository, IParkingLotService parkingLotService)
        {
            _whiteListRepository = whiteListRepository;
            _parkingLotService = parkingLotService;
        }

        public async Task<bool> IsClientWhitelistedAsync(string parkingLotId, string clientId)
        {
            var key = new WhiteListKey { ParkingLotId = parkingLotId, ClientId = clientId };
            var entity = await _whiteListRepository.FindIncludingClientReadOnly(key);
            return entity != null;
        }

        public async Task AddToWhiteListAsync(AddAttendantToWhiteListRequest request, string parkingLotOwnerId)
        {
            if (!await _parkingLotService.IsParkingLotOwner(request.ParkingLotId, parkingLotOwnerId))
                throw new InvalidInformationException(MessageKeys.UNAUTHORIZED_PARKING_LOT_OWNER);

            var key = new WhiteListKey { ParkingLotId = request.ParkingLotId, ClientId = request.ClientId };
            var exists = await _whiteListRepository.FindIncludingClientReadOnly(key);
            if (exists != null)
                throw new InvalidInformationException(MessageKeys.CLIENT_IN_WHITE_LIST_ALREADY);

            var entity = new WhiteList
            {
                ParkingLotId = request.ParkingLotId,
                ClientId = request.ClientId,
                AddedAt = DateTime.UtcNow,
                ExpireAt = request.ExpireAt
            };
            await _whiteListRepository.AddAsync(entity);
            await _whiteListRepository.SaveChangesAsync();
        }

        public async Task UpdateExpireAtAsync(UpdateWhiteListAttendantExpireDateRequest request, string parkingLotOwnerId)
        {
            if (!await _parkingLotService.IsParkingLotOwner(request.ParkingLotId, parkingLotOwnerId))
                throw new InvalidInformationException(MessageKeys.UNAUTHORIZED_PARKING_LOT_OWNER);

            var key = new WhiteListKey { ParkingLotId = request.ParkingLotId, ClientId = request.ClientId };
            var entity = await _whiteListRepository.FindIncludingClient(key);
            if (entity == null)
                throw new InvalidInformationException(MessageKeys.CLIENT_NOT_IN_WHITE_LIST);

            entity.ExpireAt = request.ExpiredDate;
            _whiteListRepository.Update(entity);
            await _whiteListRepository.SaveChangesAsync();
        }

        public async Task RemoveFromWhiteListAsync(RemoveAttendantFromWhiteListRequest request, string parkingLotOwnerId)
        {
            if (!await _parkingLotService.IsParkingLotOwner(request.ParkingLotId, parkingLotOwnerId))
                throw new InvalidInformationException(MessageKeys.UNAUTHORIZED_PARKING_LOT_OWNER);

            var key = new WhiteListKey { ParkingLotId = request.ParkingLotId, ClientId = request.ClientId };
            var entity = await _whiteListRepository.FindIncludingClient(key);
            if (entity == null)
                throw new InvalidInformationException(MessageKeys.CLIENT_NOT_IN_WHITE_LIST);

            _whiteListRepository.Remove(entity);
            await _whiteListRepository.SaveChangesAsync();
        }

        public async Task<List<WhiteListAttendantDto>> GetWhiteListAsync(GetWhiteListAttendantListRequest request)
        {
            var criterias = new List<Expression<Func<WhiteList, bool>>>();
            if (!string.IsNullOrWhiteSpace(request.ParkingLotId))
                criterias.Add(wl => wl.ParkingLotId == request.ParkingLotId);

            if (!string.IsNullOrWhiteSpace(request.SearchCriteria))
                criterias.Add(wl => wl.Client.User.FullName.Contains(request.SearchCriteria) ||
                                    wl.ClientId.Contains(request.SearchCriteria) ||
                                    wl.Client.CitizenId.Contains(request.SearchCriteria));

            var entities = await _whiteListRepository.GetAllAsync(criterias.ToArray(), 
                null, request.Order == OrderType.Asc.ToString());
            var items = new List<WhiteListAttendantDto>();
            foreach (var entity in entities)
            {
                var whitlistAttendantIncluded = await _whiteListRepository.FindIncludingClientReadOnly(new WhiteListKey
                {
                    ClientId = entity.ClientId,
                    ParkingLotId = entity.ParkingLotId
                });
                if (whitlistAttendantIncluded != null)
                    items.Add(new WhiteListAttendantDto(whitlistAttendantIncluded));
            }
            return items;
        }

        public async Task<PageResult<WhiteListAttendantDto>> GetWhiteListPageAsync(PageRequest pageRequest, GetWhiteListAttendantListRequest request)
        {
            var criterias = new List<Expression<Func<WhiteList, bool>>>();
            if (!string.IsNullOrWhiteSpace(request.ParkingLotId))
                criterias.Add(wl => wl.ParkingLotId == request.ParkingLotId);

            if (!string.IsNullOrWhiteSpace(request.SearchCriteria))
                criterias.Add(wl => wl.Client.User.FullName.Contains(request.SearchCriteria) ||
                                    wl.ClientId.Contains(request.SearchCriteria) ||
                                    wl.Client.CitizenId.Contains(request.SearchCriteria));

            var totalCount = await _whiteListRepository.CountAsync(criterias.ToArray());
            var entities = await _whiteListRepository.GetPageAsync(
                pageRequest.PageNumber,
                pageRequest.PageSize,
                criterias.ToArray(),
                null,
                request.Order == OrderType.Asc.ToString()
            );

            var items = new List<WhiteListAttendantDto>();
            foreach ( var entity in entities )
            {
                var whitlistAttendantIncluded = await _whiteListRepository.FindIncludingClientReadOnly(new WhiteListKey
                {
                    ClientId = entity.ClientId,
                    ParkingLotId = entity.ParkingLotId
                });
                if(whitlistAttendantIncluded != null)
                    items.Add(new WhiteListAttendantDto(whitlistAttendantIncluded));
            }
            return new PageResult<WhiteListAttendantDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageRequest.PageNumber,
                PageSize = pageRequest.PageSize,
            };
        }
    }
}