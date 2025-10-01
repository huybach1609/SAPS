using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using SAPLSServer.DTOs.Concrete.FileUploadDtos;
using SAPLSServer.DTOs.Concrete.VehicleDtos;
using SAPLSServer.DTOs.PaginationDto;
using SAPLSServer.Exceptions;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using SAPLSServer.Services.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Services.Implementations
{
    public class VehicleService : IVehicleService
    {
        private readonly IVehicleRepository _vehicleRepository;
        private readonly IAdminService _adminService;
        private readonly IFileService _fileService;

        public VehicleService(
            IVehicleRepository vehicleRepository,
            IAdminService adminService,
            IFileService fileService)
        {
            _vehicleRepository = vehicleRepository;
            _adminService = adminService;
            _fileService = fileService;
        }

        public async Task Create(CreateVehicleRequest request, string currentUserId)
        {
            // Check for unique License Plate
            bool licensePlateExists = await _vehicleRepository.ExistsAsync(v => v.LicensePlate == request.LicensePlate);
            if (licensePlateExists)
                throw new InvalidInformationException(MessageKeys.VEHICLE_ALREADY_EXISTS);

            var vehicleId = Guid.NewGuid().ToString();

            var frontCertUploadRequest = new FileUploadRequest
            {
                File = request.FrontVehicleRegistrationCertImage,
                Container = "vehicle-certificates",
                SubFolder = $"vehicle-{vehicleId}",
                GenerateUniqueFileName = true,
                Metadata = new Dictionary<string, string>
                {
                    { "VehicleId", vehicleId },
                    { "CertificateType", "Front" }
                }
            };

            var frontCertResult = await _fileService.UploadFileAsync(frontCertUploadRequest);

            var backCertUploadRequest = new FileUploadRequest
            {
                File = request.BackVehicleRegistrationCertImage,
                Container = "vehicle-certificates",
                SubFolder = $"vehicle-{vehicleId}",
                GenerateUniqueFileName = true,
                Metadata = new Dictionary<string, string>
                {
                    { "VehicleId", vehicleId },
                    { "CertificateType", "Back" }
                }
            };

            var backCertResult = await _fileService.UploadFileAsync(backCertUploadRequest);

            // CheckIn the vehicle entity
            var vehicle = new Vehicle
            {
                Id = vehicleId,
                LicensePlate = request.LicensePlate,
                OwnerId = currentUserId,
                CurrentHolderId = currentUserId,
                Brand = request.Brand,
                Model = request.Model,
                Color = request.Color,
                VehicleType = request.VehicleType,
                FrontVehicleRegistrationCertificateUrl = frontCertResult.CloudUrl,
                BackVehicleRegistrationCertificateUrl = backCertResult.CloudUrl,
                ChassisNumber = request.ChassisNumber,
                EngineNumber = request.EngineNumber,
                OwnerVehicleFullName = request.OwnerVehicleFullName,
                Status = VehicleStatus.Active.ToString(),
                SharingStatus = VehicleSharingStatus.Available.ToString(),
                
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            await _vehicleRepository.AddAsync(vehicle);
            await _vehicleRepository.SaveChangesAsync();
        }

        public async Task Update(UpdateVehicleRequest request, string currentUserId)
        {
            var vehicle = await _vehicleRepository.Find(request.Id);
            if (vehicle == null)
                throw new InvalidInformationException(MessageKeys.VEHICLE_NOT_FOUND);

            // Only admin can update vehicle details
            if (await _adminService.IsAdminValid(currentUserId))
            {
                throw new UnauthorizedAccessException(MessageKeys.UNAUTHORIZED_ACCESS);
            }

            vehicle.LicensePlate = request.LicensePlate;
            vehicle.Brand = request.Brand;
            vehicle.Model = request.Model;
            vehicle.EngineNumber = request.EngineNumber;
            vehicle.ChassisNumber = request.ChassisNumber;
            vehicle.Color = request.Color;
            vehicle.OwnerVehicleFullName = request.OwnerVehicleFullName;
            vehicle.VehicleType = request.VehicleType;
            vehicle.UpdatedAt = DateTime.UtcNow;
            vehicle.UpdatedBy = currentUserId;
            vehicle.FrontVehicleRegistrationCertificateUrl = request.FrontVehicleRegistrationCertImageUrl;
            vehicle.BackVehicleRegistrationCertificateUrl = request.BackVehicleRegistrationCertImageUrl;
            _vehicleRepository.Update(vehicle);
            await _vehicleRepository.SaveChangesAsync();
        }

        public async Task UpdateStatus(UpdateVehicleStatusRequest request, string currentUserId)
        {
            var vehicle = await _vehicleRepository.Find(request.Id) ??
                throw new InvalidInformationException(MessageKeys.VEHICLE_NOT_FOUND);

            // Only owner can update status
            if (currentUserId != vehicle.OwnerId)
            {
                throw new UnauthorizedAccessException(MessageKeys.UNAUTHORIZED_ACCESS);
            }

            vehicle.Status = request.Status;
            vehicle.UpdatedAt = DateTime.UtcNow;
            _vehicleRepository.Update(vehicle);
            await _vehicleRepository.SaveChangesAsync();
        }

        public async Task UpdateCurrentDriver(string id, string currentUserId)
        {
            var vehicle = await _vehicleRepository.Find(id) ??
                throw new InvalidInformationException(MessageKeys.VEHICLE_NOT_FOUND);

            vehicle.CurrentHolderId = currentUserId;
            vehicle.UpdatedAt = DateTime.UtcNow;
            _vehicleRepository.Update(vehicle);
            await _vehicleRepository.SaveChangesAsync();
        }


        public async Task DeleteVehicle(DeleteRequest request, string currentUserId)
        {
            var vehicle = await _vehicleRepository.Find(request.Id) ??
                throw new InvalidInformationException(MessageKeys.VEHICLE_NOT_FOUND);

            // Only owner can delete vehicle
            if (currentUserId != vehicle.OwnerId)
            {
                throw new UnauthorizedAccessException(MessageKeys.UNAUTHORIZED_ACCESS);
            }

            _vehicleRepository.Remove(vehicle);
            await _vehicleRepository.SaveChangesAsync();
        }

        public async Task<VehicleDetailsDto?> GetById(string id)
        {
            var vehicle = await _vehicleRepository.FindIncludeOwnerAndCurrentHolder(id);
            if (vehicle == null)
                return null;
            return new VehicleDetailsDto(vehicle);
        }

        public async Task<VehicleDetailsDto?> GetByLicensePlate(string licensePlate)
        {
            var vehicle = await _vehicleRepository.FindIncludeOwnerAndCurrentHolder(v => v.LicensePlate == licensePlate);
            if (vehicle == null)
                return null;
            return new VehicleDetailsDto(vehicle);
        }

        public async Task<PageResult<VehicleSummaryDto>> GetVehiclesPage(PageRequest pageRequest, GetVehicleListRequest request)
        {
            var criterias = BuildVehicleCriteria(request);
            var criteriasArray = criterias.ToArray();
            var totalCount = await _vehicleRepository.CountAsync(criteriasArray);
            var vehicles = await _vehicleRepository.GetPageAsync(
                pageRequest.PageNumber, pageRequest.PageSize, criteriasArray, null,
                request.Order == OrderType.Asc.ToString());

            var items = new List<VehicleSummaryDto>();
            foreach (var vehicle in vehicles)
            {
                if(vehicle.Owner != null)
                {
                    var vehicleIncludedOwnerAndCurrentHolder = await _vehicleRepository.FindIncludeOwnerAndCurrentHolder(vehicle.Id);
                    items.Add(new VehicleSummaryDto(vehicleIncludedOwnerAndCurrentHolder!));
                }
            }
            return new PageResult<VehicleSummaryDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageRequest.PageNumber,
                PageSize = pageRequest.PageSize
            };
        }

        public async Task<List<VehicleSummaryDto>> GetAllVehicles(GetVehicleListRequest request)
        {
            var criterias = BuildVehicleCriteria(request);
            var criteriasArray = criterias.ToArray();
            var vehicles = await _vehicleRepository.GetAllAsync(criteriasArray, null,
                request.Order == OrderType.Asc.ToString());
            var items = new List<VehicleSummaryDto>();
            foreach (var vehicle in vehicles)
            {
                if (vehicle.Owner != null)
                {
                    var vehicleIncludedOwnerAndCurrentHolder = await _vehicleRepository.FindIncludeOwnerAndCurrentHolder(vehicle.Id);
                    items.Add(new VehicleSummaryDto(vehicleIncludedOwnerAndCurrentHolder!));
                }
            }
            return items;
        }

        private List<Expression<Func<Vehicle, bool>>> BuildVehicleCriteria(GetVehicleListRequest request)
        {
            var criterias = new List<Expression<Func<Vehicle, bool>>>
            {
                // OwnerId is required, so always filter by it
                v => v.OwnerId == request.OwnerId
            };

            if (!string.IsNullOrWhiteSpace(request.SharingStatus))
            {
                criterias.Add(v => v.SharingStatus == request.SharingStatus);
            }

            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                criterias.Add(v => v.Status == request.Status);
            }

            if (!string.IsNullOrWhiteSpace(request.SearchCriteria))
            {
                criterias.Add(v => v.LicensePlate.Contains(request.SearchCriteria) ||
                                  v.Brand.Contains(request.SearchCriteria) ||
                                  v.Model.Contains(request.SearchCriteria) ||
                                  v.Color.Contains(request.SearchCriteria));
            }

            return criterias;
        }
        public async Task UpdateVehicleSharingStatus(UpdateVehicleSharingStatusRequest request, string currentUserId)
        {
            var vehicle = await _vehicleRepository.Find(request.Id);
            if (vehicle == null)
                throw new InvalidInformationException(MessageKeys.VEHICLE_NOT_FOUND);

            // Only owner or person who is shared the vehicle with can change sharing status
            if (currentUserId != vehicle.OwnerId && currentUserId != vehicle.CurrentHolderId)
            {
                throw new UnauthorizedAccessException(MessageKeys.UNAUTHORIZED_ACCESS);
            }

            vehicle.SharingStatus = request.SharingStatus;
            vehicle.UpdatedAt = DateTime.UtcNow;
            _vehicleRepository.Update(vehicle);
            await _vehicleRepository.SaveChangesAsync();
        }

        public async Task<string?> GetCurrentHolderId(string vehicleId)
        {
           var vehicle = await _vehicleRepository.Find(vehicleId);
            if (vehicle == null)
                return null;
            return vehicle.CurrentHolderId;
        }
    }
}
