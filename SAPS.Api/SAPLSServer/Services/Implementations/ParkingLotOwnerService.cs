using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using SAPLSServer.DTOs.Concrete;
using SAPLSServer.DTOs.Concrete.UserDtos;
using SAPLSServer.DTOs.PaginationDto;
using SAPLSServer.Exceptions;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using SAPLSServer.Services.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Services.Implementations
{
    public class ParkingLotOwnerService : IParkingLotOwnerService
    {
        private readonly IParkingLotOwnerProfileRepository _parkingLotOwnerProfileRepository;
        private readonly IUserService _userService;
        private readonly IPasswordService _passwordService;

        public ParkingLotOwnerService(IUserService userService,
            IPasswordService passwordService,
            IParkingLotOwnerProfileRepository parkingLotOwnerProfileRepository)
        {
            _userService = userService;
            _passwordService = passwordService;
            _parkingLotOwnerProfileRepository = parkingLotOwnerProfileRepository;
        }

        public async Task Create(CreateParkingLotOwnerProfileRequest request, string createPerformerId)
        {
            // Check for unique ParkingLotId
            bool ownerIdExists = await _parkingLotOwnerProfileRepository
                .ExistsAsync(o => o.ParkingLotOwnerId == request.ParkingLotOwnerId);
            if (ownerIdExists)
                throw new InvalidInformationException(MessageKeys.PARKING_LOT_OWNER_ID_ALREADY_EXISTS);
            request.Password = _passwordService.RandomizePassword();
            var userId = await _userService.Create(request, UserRole.ParkingLotOwner);
            try
            {
                var ownerProfile = new ParkingLotOwnerProfile
                {
                    UserId = userId,
                    ParkingLotOwnerId = request.ParkingLotOwnerId,
                    ApiKey = request.ApiKey,
                    ClientKey = request.ClientKey,
                    CheckSumKey = request.CheckSumKey,
                    CreatedBy = createPerformerId,
                    UpdatedBy = createPerformerId,
                };
                await _parkingLotOwnerProfileRepository.AddAsync(ownerProfile);
                await _parkingLotOwnerProfileRepository.SaveChangesAsync();
            }
            catch(Exception)
            {
                await _userService.Delete(userId);
                throw;
            }
        }

        public async Task Update(UpdateParkingLotOwnerProfileRequest request, string updatePerformerId)
        {
            var ownerProfile = await _parkingLotOwnerProfileRepository.FindIncludingUser(request.Id);
            if (ownerProfile == null)
                throw new InvalidInformationException(MessageKeys.PARKING_LOT_OWNER_PROFILE_NOT_FOUND);

            ownerProfile.ParkingLotOwnerId = request.ParkingLotOwnerId;
            ownerProfile.ApiKey = request.ApiKey;
            ownerProfile.ClientKey = request.ClientKey;
            ownerProfile.CheckSumKey = request.CheckSumKey;
            ownerProfile.UpdatedBy = updatePerformerId;
            ownerProfile.User.UpdatedAt = DateTime.UtcNow;
            _parkingLotOwnerProfileRepository.Update(ownerProfile);
            await _parkingLotOwnerProfileRepository.SaveChangesAsync();
        }

        public async Task<ParkingLotOwnerProfileDetailsDto?> GetParkingLotOwnerProfileDetails(
            GetDetailsRequest request)
        {
            var ownerProfile = await _parkingLotOwnerProfileRepository.FindIncludingUserReadOnly(request.Id);
            if (ownerProfile == null)
                return null;
            return new ParkingLotOwnerProfileDetailsDto(ownerProfile);
        }

        public async Task<PageResult<ParkingLotOwnerProfileSummaryDto>> GetParkingLotOwnerProfilesPage(
            PageRequest pageRequest, GetParkingLotOwnerListRequest request)
        {
            var criterias = new List<Expression<Func<ParkingLotOwnerProfile, bool>>>();
            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                criterias.Add(plo => plo.User.Status == request.Status);
            }
            if (!string.IsNullOrWhiteSpace(request.SearchCriteria)) 
            {
                criterias.Add(plo => plo.User.FullName.Contains(request.SearchCriteria) ||
                        plo.User.Email.Contains(request.SearchCriteria) ||
                        plo.User.Phone.Contains(request.SearchCriteria));
            }
            var criteriaArray = criterias.ToArray();
            var totalCount = await _parkingLotOwnerProfileRepository.CountAsync(criteriaArray);
            var owners = await _parkingLotOwnerProfileRepository.GetPageAsync(
                                        pageRequest.PageNumber, pageRequest.PageSize, criteriaArray, 
                                        null, request.Order == OrderType.Asc.ToString());
            var items = new List<ParkingLotOwnerProfileSummaryDto>();
            foreach (var owner in owners)
            {
                var ownerIncludingUser = await _parkingLotOwnerProfileRepository
                    .FindIncludingUserReadOnly(owner.UserId);
                if(ownerIncludingUser == null)
                {
                    continue;
                }
                items.Add(new ParkingLotOwnerProfileSummaryDto(ownerIncludingUser));
            }
            return new PageResult<ParkingLotOwnerProfileSummaryDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageRequest.PageNumber,
                PageSize = pageRequest.PageSize,
            };
        }

        public async Task<List<ParkingLotOwnerProfileSummaryDto>> GetParkingLotOwnerProfiles(
            GetParkingLotOwnerListRequest request)
        {
            var criterias = new List<Expression<Func<ParkingLotOwnerProfile, bool>>>();
            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                criterias.Add(plo => plo.User.Status == request.Status);
            }
            if (!string.IsNullOrWhiteSpace(request.SearchCriteria))
            {
                criterias.Add(plo => plo.ParkingLotOwnerId.Contains(request.SearchCriteria) ||
                plo.User.FullName.Contains(request.SearchCriteria) ||
                plo.User.Email.Contains(request.SearchCriteria) ||
                plo.User.Phone.Contains(request.SearchCriteria));
            }
            var owners = await _parkingLotOwnerProfileRepository.GetAllAsync(criterias.ToArray(), 
                null, request.Order == OrderType.Asc.ToString());
            var items = new List<ParkingLotOwnerProfileSummaryDto>();
            foreach (var owner in owners)
            {
                var ownerIncludingUser = await _parkingLotOwnerProfileRepository
                    .FindIncludingUserReadOnly(owner.UserId);
                if (ownerIncludingUser == null)
                {
                    continue;
                }
                items.Add(new ParkingLotOwnerProfileSummaryDto(ownerIncludingUser));
            }
            return items;
        }

        public async Task<ParkingLotOwnerProfileDetailsDto?> GetByParkingLotOwnerId(string parkingLotOwnerId)
        {
            var ownerProfile = await _parkingLotOwnerProfileRepository
                .FindIncludingUserReadOnly([plo => plo.ParkingLotOwnerId == parkingLotOwnerId])
                ?? throw new InvalidInformationException(MessageKeys.PARKING_LOT_OWNER_PROFILE_NOT_FOUND);
            return new ParkingLotOwnerProfileDetailsDto(ownerProfile);
        }

        public async Task<ParkingLotOwnerProfileDetailsDto?> GetByUserId(string userId)
        {
            var ownerProfile = await _parkingLotOwnerProfileRepository
                .FindIncludingUserReadOnly([o => o.UserId == userId])
                ?? throw new InvalidInformationException(MessageKeys.PARKING_LOT_OWNER_PROFILE_NOT_FOUND);
            return new ParkingLotOwnerProfileDetailsDto(ownerProfile);
        }
        public async Task<bool> IsParkingLotOwnerValid(string userId)
        {
            if(!await _userService.IsUserValid(userId))
            {
                return false;
            }
            return await _parkingLotOwnerProfileRepository
                .ExistsAsync(o => o.UserId == userId);
        }
    }
}