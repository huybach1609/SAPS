using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using SAPLSServer.DTOs.Concrete.UserDtos;
using SAPLSServer.DTOs.Concrete.FileUploadDtos;
using SAPLSServer.DTOs.PaginationDto;
using SAPLSServer.Exceptions;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using SAPLSServer.Services.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Services.Implementations
{
    public class ClientService : IClientService
    {
        private readonly IClientProfileRepository _clientProfileRepository;
        private readonly IUserService _userService;
        private readonly IVehicleShareCodeService _vehicleShareCodeService;
        private readonly IAdminService _adminService;
        private readonly IFileService _fileService;

        public ClientService(IUserService userService, IVehicleShareCodeService vehicleShareCodeService,
            IClientProfileRepository clientProfileRepository, IFileService fileService, IAdminService adminService)
        {
            _userService = userService;
            _vehicleShareCodeService = vehicleShareCodeService;

            _clientProfileRepository = clientProfileRepository;
            _fileService = fileService;
            _adminService = adminService;
        }

        public async Task Create(CreateClientProfileRequest request)
        {
            string userId = await _userService.Create(request, UserRole.Client);
            try
            {
                var clientProfile = new ClientProfile
                {
                    UserId = userId,
                    CitizenId = $"{UserStatus.Unverified.ToString()}_{userId}",
                    DateOfBirth = DateOnly.FromDateTime(DateTime.UtcNow),
                    Sex = true,
                    Nationality = string.Empty,
                    PlaceOfOrigin = string.Empty,
                    PlaceOfResidence = string.Empty,
                    ShareCode = _vehicleShareCodeService.GenerateShareCode(VehicleShareCodeService.VEHICLE_SHARE_CODE_LENGTH),
                };
                while (await _clientProfileRepository.ExistsAsync(cp => cp.ShareCode == clientProfile.ShareCode))
                {
                    clientProfile.ShareCode = _vehicleShareCodeService.GenerateShareCode(VehicleShareCodeService.VEHICLE_SHARE_CODE_LENGTH);
                }
                await _clientProfileRepository.AddAsync(clientProfile);
                await _clientProfileRepository.SaveChangesAsync();
            }
            catch
            {
                await _userService.Delete(userId);
                throw;
            }
        }

        public async Task Update(UpdateClientProfileRequest request, string updatePerformerId)
        {
            var clientProfile = await _clientProfileRepository.FindIncludingUser(request.Id);
            if (clientProfile == null)
                throw new InvalidInformationException(MessageKeys.CLIENT_PROFILE_NOT_FOUND);
            bool citizenIdExists = await _clientProfileRepository.ExistsAsync(cp => cp.CitizenId == request.CitizenId
                                                                                && cp.UserId != request.Id);
            if (citizenIdExists)
                throw new InvalidInformationException(MessageKeys.CITIZEN_ID_ALREADY_EXISTS);
            if (await _adminService.IsAdminValid(updatePerformerId))
            {
                throw new UnauthorizedAccessException(MessageKeys.UNAUTHORIZED_ACCESS);
            }
            // Upload front citizen card image
            var frontImageUploadRequest = new FileUploadRequest
            {
                File = request.FrontCitizenCardImage,
                Container = "citizen-id-cards",
                SubFolder = $"client-{request.Id}",
                GenerateUniqueFileName = true,
                Metadata = new Dictionary<string, string>
                {
                    { "UserId", request.Id },
                    { "ImageType", "FrontCitizenIdCard" }
                }
            };
            var frontImageResult = await _fileService.UploadFileAsync(frontImageUploadRequest);

            // Upload back citizen card image
            var backImageUploadRequest = new FileUploadRequest
            {
                File = request.BackCitizenCardImage,
                Container = "citizen-id-cards",
                SubFolder = $"client-{request.Id}",
                GenerateUniqueFileName = true,
                Metadata = new Dictionary<string, string>
                {
                    { "UserId", request.Id },
                    { "ImageType", "BackCitizenIdCard" }
                }
            };
            var backImageResult = await _fileService.UploadFileAsync(backImageUploadRequest);

            clientProfile.CitizenId = request.CitizenId;
            clientProfile.DateOfBirth = request.DateOfBirth;
            clientProfile.Sex = request.Sex;
            clientProfile.Nationality = request.Nationality;
            clientProfile.PlaceOfOrigin = request.PlaceOfOrigin;
            clientProfile.PlaceOfResidence = request.PlaceOfResidence;
            clientProfile.FrontCitizenIdCardImageUrl = frontImageResult.CdnUrl;
            clientProfile.BackCitizenIdCardImageUrl = backImageResult.CdnUrl;
            if (string.IsNullOrWhiteSpace(clientProfile.ShareCode))
            {
                clientProfile.ShareCode = _vehicleShareCodeService.GenerateShareCode(VehicleShareCodeService.VEHICLE_SHARE_CODE_LENGTH);
            }
            clientProfile.User.UpdatedAt = DateTime.UtcNow;

            _clientProfileRepository.Update(clientProfile);
            await _clientProfileRepository.SaveChangesAsync();
        }

        public async Task<ClientProfileDetailsDto?> GetClientProfileDetails(GetDetailsRequest request)
        {
            var clientProfile = await _clientProfileRepository.FindIncludingUserReadOnly(request.Id);
            if (clientProfile == null)
                return null;
            return new ClientProfileDetailsDto(clientProfile);
        }

        public async Task<PageResult<ClientProfileSummaryDto>> GetClientProfilesPage(PageRequest pageRequest, GetClientListRequest request)
        {
            var criterias = new List<Expression<Func<ClientProfile, bool>>>();

            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                criterias.Add(cp => cp.User.Status == request.Status);
            }
            if (!string.IsNullOrWhiteSpace(request.SearchCriteria))
            {
                criterias.Add(cp => cp.User.FullName.Contains(request.SearchCriteria) ||
                        cp.User.Email.Contains(request.SearchCriteria) ||
                        cp.User.Phone.Contains(request.SearchCriteria) ||
                        cp.CitizenId.Contains(request.SearchCriteria));
            }
            var criteriasArray = criterias.ToArray();
            var totalCount = await _clientProfileRepository.CountAsync(criteriasArray);
            var clients = await _clientProfileRepository.GetPageAsync(
                                        pageRequest.PageNumber, pageRequest.PageSize,
                                        criteriasArray, null, request.Order == OrderType.Asc.ToString());
            var items = new List<ClientProfileSummaryDto>();
            foreach (var client in clients)
            {
                var clientIncludingUser = await _clientProfileRepository.FindIncludingUserReadOnly(client.UserId);
                if (clientIncludingUser == null)
                    continue; // Skip if client profile is not found
                items.Add(new ClientProfileSummaryDto(clientIncludingUser));
            }
            return new PageResult<ClientProfileSummaryDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageRequest.PageNumber,
                PageSize = pageRequest.PageSize,
            };
        }

        public async Task<ClientProfileDetailsDto?> GetByCitizenIdNo(string citizenIdNo)
        {
            var clientProfile = await _clientProfileRepository.FindIncludingUserReadOnly([c => c.CitizenId == citizenIdNo])
                ?? throw new InvalidInformationException(MessageKeys.CLIENT_PROFILE_NOT_FOUND);
            return new ClientProfileDetailsDto(clientProfile);
        }

        public async Task<ClientProfileDetailsDto?> GetByUserId(string userId)
        {
            var clientProfile = await _clientProfileRepository.FindIncludingUserReadOnly([c => c.UserId == userId])
                ?? throw new InvalidInformationException(MessageKeys.CLIENT_PROFILE_NOT_FOUND);
            return new ClientProfileDetailsDto(clientProfile);
        }

        public async Task<ClientProfileSummaryDto> GetUserIdByShareCode(string shareCode)
        {
            var clientProfile = await _clientProfileRepository.FindIncludingUserReadOnly([c => c.ShareCode == shareCode])
                ?? throw new InvalidInformationException(MessageKeys.CLIENT_PROFILE_NOT_FOUND);
            return new ClientProfileSummaryDto(clientProfile);
        }

        public async Task UpdateDeviceToken(string userId, string? deviceToken)
        {
            var client = await _clientProfileRepository.FindIncludingUser(userId)
                ?? throw new InvalidInformationException(MessageKeys.USER_NOT_FOUND);
            client.DeviceToken = deviceToken;
            _clientProfileRepository.Update(client);
            await _clientProfileRepository.SaveChangesAsync();
        }

        public async Task<string?> GetDeviceToken(string userId)
        {
            var client = await _clientProfileRepository.Find(userId);
            if (client == null)
            {
                return null;
            }
            return client.DeviceToken;
        }
        public async Task<bool> IsClientValid(string userId)
        {
            if (!await _userService.IsUserValid(userId))
            {
                return false;
            }
            return await _clientProfileRepository.ExistsAsync(cp => cp.UserId == userId);
        }

        public async Task VerifyLevelTwo(VerifyLevelTwoClientRequest request, string performerId)
        {
            // Only allow the user to verify their own profile
            if (performerId != request.Id)
            {
                throw new UnauthorizedAccessException(MessageKeys.UNAUTHORIZED_ACCESS);
            }

            // Retrieve the client profile
            var client = await _clientProfileRepository.FindIncludingUser(request.Id)
                ?? throw new InvalidInformationException(MessageKeys.CLIENT_PROFILE_NOT_FOUND);

            // Check if the citizen ID is already used by another client
            bool citizenIdExists = await _clientProfileRepository.ExistsAsync(cp => cp.CitizenId == request.CitizenId && cp.UserId != request.Id);
            if (citizenIdExists)
            {
                throw new InvalidInformationException(MessageKeys.CITIZEN_ID_ALREADY_EXISTS);
            }

            // Upload front citizen card image
            var frontImageUploadRequest = new FileUploadRequest
            {
                File = request.FrontCitizenCardImage,
                Container = "citizen-id-cards",
                SubFolder = $"client-{request.Id}",
                GenerateUniqueFileName = true,
                Metadata = new Dictionary<string, string>
                {
                    { "UserId", request.Id },
                    { "ImageType", "FrontCitizenIdCard" }
                }
            };
            var frontImageResult = await _fileService.UploadFileAsync(frontImageUploadRequest);

            // Upload back citizen card image
            var backImageUploadRequest = new FileUploadRequest
            {
                File = request.BackCitizenCardImage,
                Container = "citizen-id-cards",
                SubFolder = $"client-{request.Id}",
                GenerateUniqueFileName = true,
                Metadata = new Dictionary<string, string>
                {
                    { "UserId", request.Id },
                    { "ImageType", "BackCitizenIdCard" }
                }
            };
            var backImageResult = await _fileService.UploadFileAsync(backImageUploadRequest);

            // Update all properties from VerifyLevelTwoClientRequest
            client.CitizenId = request.CitizenId;
            client.DateOfBirth = request.DateOfBirth;
            client.Sex = request.Sex;
            client.Nationality = request.Nationality;
            client.PlaceOfOrigin = request.PlaceOfOrigin;
            client.PlaceOfResidence = request.PlaceOfResidence;
            client.FrontCitizenIdCardImageUrl = frontImageResult.CdnUrl ?? frontImageResult.CloudUrl;
            client.ShareCode = _vehicleShareCodeService.GenerateShareCode(VehicleShareCodeService.VEHICLE_SHARE_CODE_LENGTH);
            client.BackCitizenIdCardImageUrl = backImageResult.CdnUrl ?? backImageResult.CloudUrl;
            client.UpdatedBy = performerId;
            client.User.UpdatedAt = DateTime.UtcNow;

            _clientProfileRepository.Update(client);
            await _clientProfileRepository.SaveChangesAsync();
        }

        public async Task<bool> IsVerifyLevelTwo(string userId)
        {
            var client = await _clientProfileRepository.FindIncludingUser(userId);
            if (client == null)
                return false;

            // Level two verification: all required fields and both images must be present
            bool hasAllInfo =
                !string.IsNullOrWhiteSpace(client.CitizenId) &&
                client.DateOfBirth != default &&
                !string.IsNullOrWhiteSpace(client.Nationality) &&
                !string.IsNullOrWhiteSpace(client.PlaceOfOrigin) &&
                !string.IsNullOrWhiteSpace(client.PlaceOfResidence) &&
                client.FrontCitizenIdCardImageUrl != null &&
                client.BackCitizenIdCardImageUrl != null;

            return hasAllInfo;
        }

        public async Task<List<ClientProfileSummaryDto>> GetClientProfiles(GetClientListRequest request)
        {
            var criterias = new List<Expression<Func<ClientProfile, bool>>>();

            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                criterias.Add(cp => cp.User.Status == request.Status);
            }
            if (!string.IsNullOrWhiteSpace(request.SearchCriteria))
            {
                criterias.Add(cp => cp.User.FullName.Contains(request.SearchCriteria) ||
                        cp.User.Email.Contains(request.SearchCriteria) ||
                        cp.User.Phone.Contains(request.SearchCriteria) ||
                        cp.CitizenId.Contains(request.SearchCriteria));
            }
            var criteriasArray = criterias.ToArray();
            var clients = await _clientProfileRepository.GetAllAsync(criteriasArray, null, request.Order == OrderType.Asc.ToString());
            var items = new List<ClientProfileSummaryDto>();
            foreach (var client in clients)
            {
                var clientIncludingUser = await _clientProfileRepository.FindIncludingUserReadOnly(client.UserId);
                if (clientIncludingUser == null)
                    continue; // Skip if client profile is not found
                items.Add(new ClientProfileSummaryDto(clientIncludingUser));
            }
            return items;
        }
    }
}