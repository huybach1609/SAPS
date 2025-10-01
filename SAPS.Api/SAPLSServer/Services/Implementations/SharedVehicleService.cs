using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using SAPLSServer.DTOs.Concrete.SharedVehicleDtos;
using SAPLSServer.DTOs.Concrete.VehicleDtos;
using SAPLSServer.DTOs.PaginationDto;
using SAPLSServer.Exceptions;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using SAPLSServer.Services.Interfaces;
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

namespace SAPLSServer.Services.Implementations
{
    public class SharedVehicleService : ISharedVehicleService
    {
        private readonly IVehicleService _vehicleService;
        private readonly ISharedVehicleRepository _sharedVehicleRepository;
        private readonly IVehicleRepository _vehicleRepository;
        private readonly ISharedVehicleNotificationService _notificationService;
        private readonly IUserService _userService;

        public SharedVehicleService(IVehicleService vehicleService, 
            ISharedVehicleRepository sharedVehicleRepository, 
            IVehicleRepository vehicleRepository,
            ISharedVehicleNotificationService notificationService,
            IUserService userService)
        {
            _vehicleService = vehicleService;
            _sharedVehicleRepository = sharedVehicleRepository;
            _vehicleRepository = vehicleRepository;
            _notificationService = notificationService;
            _userService = userService;
        }

        public async Task Create(CreateSharedVehicleRequest request)
        {
            var vehicle = await _vehicleRepository.Find(request.VehicleId);
            if(vehicle == null)
                throw new InvalidInformationException(MessageKeys.VEHICLE_NOT_FOUND);
            
            if (vehicle.SharingStatus == VehicleSharingStatus.Shared.ToString())
            {
                throw new InvalidInformationException(MessageKeys.VEHICLE_ALREADY_SHARED);
            }
            
            if(vehicle.OwnerId != request.OwnerId)
            {
                throw new UnauthorizedAccessException(MessageKeys.UNAUTHORIZED_ACCESS);
            }

            var sharedVehicle = new SharedVehicle
            {
                Id = Guid.NewGuid().ToString(),
                VehicleId = request.VehicleId,
                InviteAt = DateTime.UtcNow,
                ExpireAt = DateTime.UtcNow.AddHours(1),
                Note = request.Note,
                SharedPersonId = request.SharedPersonId,
            };
            
            await _sharedVehicleRepository.AddAsync(sharedVehicle);
            await _sharedVehicleRepository.SaveChangesAsync();

            // Update vehicle sharing status to Pending
            var updateRequest = new UpdateVehicleSharingStatusRequest
            {
                Id = request.VehicleId,
                SharingStatus = VehicleSharingStatus.Pending.ToString()
            };
            await _vehicleService.UpdateVehicleSharingStatus(updateRequest, request.OwnerId);

            // Send notification to shared person
            var owner = await _userService.GetById(request.OwnerId);
            if (owner != null)
            {
                await _notificationService.SendVehicleSharingInvitationAsync(
                    request.SharedPersonId, vehicle, owner.FullName, request.Note);
            }
        }

        public async Task<SharedVehicleDetailsDto?> GetSharedVehicleDetails(string id, string currentUserId)
        {
            var sharedVehicle = await _sharedVehicleRepository.FindIncludingVehicleAndOwner(id)
                                ?? throw new InvalidInformationException(MessageKeys.SHARED_VEHICLE_NOT_FOUND);
            return new SharedVehicleDetailsDto(sharedVehicle);
        }

        public async Task<List<SharedVehicleSummaryDto>> GetSharedVehiclesList(GetSharedVehicleList request)
        {
            var criterias = new Expression<Func<SharedVehicle, bool>>[]
            {
                x => x.SharedPersonId == request.SharedPersonId
            };
            var sharedVehicles = await _sharedVehicleRepository.GetAllAsync(criterias,
                null, request.Order == OrderType.Asc.ToString());
            var items = new List<SharedVehicleSummaryDto>();
            foreach (var sharedVehicle in sharedVehicles)
            {
                var sharedVehicleWithDependencies = await _sharedVehicleRepository.FindIncludingVehicleAndOwnerReadOnly(sharedVehicle.Id);
                if (sharedVehicleWithDependencies == null)
                    continue;
                items.Add(new SharedVehicleSummaryDto(sharedVehicleWithDependencies));
            }
            return items;
        }

        public async Task<PageResult<SharedVehicleSummaryDto>> GetSharedVehiclesPage(PageRequest pageRequest, GetSharedVehicleList request)
        {
            var criterias = new Expression<Func<SharedVehicle, bool>>[]
            {
                x => x.SharedPersonId == request.SharedPersonId
            };

            var totalCount = await _sharedVehicleRepository.CountAsync(criterias);
            var sharedVehicles = await _sharedVehicleRepository.GetPageAsync(
                pageRequest.PageNumber,
                pageRequest.PageSize,
                criterias
            );

            var items = new List<SharedVehicleSummaryDto>();
            foreach (var sharedVehicle in sharedVehicles)
            {
                var sharedVehicleWithDependencies = await _sharedVehicleRepository.FindIncludingVehicleAndOwnerReadOnly(sharedVehicle.Id);
                if (sharedVehicleWithDependencies == null)
                    continue;
                items.Add(new SharedVehicleSummaryDto(sharedVehicleWithDependencies));
            }

            return new PageResult<SharedVehicleSummaryDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageRequest.PageNumber,
                PageSize = pageRequest.PageSize
            };
        }

        public async Task AcceptSharedVehicle(string id, string sharedPersonId)
        {
            var sharedVehicle = await _sharedVehicleRepository.FindIncludingVehicleAndOwner(id);
            if(sharedVehicle == null )
                throw new InvalidInformationException(MessageKeys.SHARED_VEHICLE_NOT_FOUND);
            if(sharedVehicle.SharedPersonId != sharedPersonId)
            {
                throw new UnauthorizedAccessException(MessageKeys.UNAUTHORIZED_ACCESS);
            }
            sharedVehicle.AcceptAt = DateTime.UtcNow;
            _sharedVehicleRepository.Update(sharedVehicle);
            await _sharedVehicleRepository.SaveChangesAsync();
            await _vehicleService.UpdateCurrentDriver(sharedVehicle.VehicleId, sharedPersonId);
            await _vehicleService.UpdateVehicleSharingStatus(
                new UpdateVehicleSharingStatusRequest
                {
                    Id = sharedVehicle.VehicleId,
                    SharingStatus = VehicleSharingStatus.Shared.ToString()
                }, sharedPersonId);

            // Send notification to vehicle owner
            var sharedPerson = await _userService.GetById(sharedPersonId);
            if (sharedPerson != null)
            {
                await _notificationService.SendVehicleSharingAcceptedAsync(
                    sharedVehicle.Vehicle.OwnerId, sharedVehicle, sharedPerson.FullName);
            }
        }

        public async Task RejectSharedVehicle(string id, string sharedPersonId)
        {
            var sharedVehicle = await _sharedVehicleRepository.FindIncludingVehicle(id);

            if (sharedVehicle == null)
                throw new InvalidInformationException(MessageKeys.SHARED_VEHICLE_NOT_FOUND);
            if(sharedVehicle.SharedPersonId != sharedPersonId)
            {
                throw new UnauthorizedAccessException(MessageKeys.UNAUTHORIZED_ACCESS);
            }
            _sharedVehicleRepository.Remove(sharedVehicle);
            await _sharedVehicleRepository.SaveChangesAsync();

            await _vehicleService.UpdateCurrentDriver(sharedVehicle.VehicleId, sharedVehicle.Vehicle.OwnerId);

            await _vehicleService.UpdateVehicleSharingStatus(
                new UpdateVehicleSharingStatusRequest
                {
                    Id = sharedVehicle.VehicleId,
                    SharingStatus = VehicleSharingStatus.Available.ToString()
                }, sharedPersonId);

            // Send notification to vehicle owner
            var sharedPerson = await _userService.GetById(sharedPersonId);
            if (sharedPerson != null)
            {
                await _notificationService.SendVehicleSharingRejectedAsync(
                    sharedVehicle.Vehicle.OwnerId, sharedVehicle, sharedPerson.FullName);
            }
        }

        public async Task RecallSharedVehicle(string id, string ownerId)
        {
            var sharedVehicle = await _sharedVehicleRepository.FindIncludingVehicle(id);
            if (sharedVehicle == null)
                throw new InvalidInformationException(MessageKeys.SHARED_VEHICLE_NOT_FOUND);
            if (sharedVehicle.Vehicle.OwnerId != ownerId)
            {
                throw new UnauthorizedAccessException(MessageKeys.UNAUTHORIZED_ACCESS);
            }
            var sharedPersonId = sharedVehicle.SharedPersonId;
            if(sharedPersonId == null)
            {
                throw new InvalidOperationException(MessageKeys.VEHICLE_NOT_SHARED);
            }
            _sharedVehicleRepository.Remove(sharedVehicle);
            await _sharedVehicleRepository.SaveChangesAsync();
            await _vehicleService.UpdateCurrentDriver(sharedVehicle.VehicleId, ownerId);
            await _vehicleService.UpdateVehicleSharingStatus(
                new UpdateVehicleSharingStatusRequest
                {
                    Id = sharedVehicle.VehicleId,
                    SharingStatus = VehicleSharingStatus.Available.ToString()
                }, ownerId);

            // Send notification to shared person
            var owner = await _userService.GetById(ownerId);
            if (owner != null)
            {
                await _notificationService.SendVehicleSharingRecalledAsync(sharedPersonId, sharedVehicle, 
                    owner.FullName);
            }
        }

        public async Task<SharedVehicleDetailsDto?> GetByVehicleId(string vehicleId)
        {
            var sharedVehicle = await _sharedVehicleRepository.FindIncludingVehicleAndOwnerAndSharedPersonReadOnly(
                [sv => sv.VehicleId == vehicleId]);
            if (sharedVehicle == null)
            {
                return null;
            }
            return new SharedVehicleDetailsDto(sharedVehicle);
        }
    }
}
