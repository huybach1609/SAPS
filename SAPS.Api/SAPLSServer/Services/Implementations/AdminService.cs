using SAPLSServer.Constants;
using SAPLSServer.DTOs.Base;
using SAPLSServer.DTOs.Concrete.UserDtos;
using SAPLSServer.DTOs.PaginationDto;
using SAPLSServer.Exceptions;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using SAPLSServer.Services.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Services.Implementations
{
    public class AdminService : IAdminService
    {
        private readonly IAdminProfileRepository _adminProfileRepository;
        private readonly IUserService _userService;
        private readonly IPasswordService _passwordService;

        public AdminService(IUserService userService, IAdminProfileRepository adminProfileRepository, 
            IPasswordService passwordService)
        {
            _userService = userService;
            _passwordService = passwordService;
            _adminProfileRepository = adminProfileRepository;
        }

        public async Task Create(CreateAdminProfileRequest request, string performedByAdminUserId)
        {

            // Check for unique AdminId
            bool adminIdExists = await _adminProfileRepository.ExistsAsync(a => a.AdminId == request.AdminId);
            if (adminIdExists)
                throw new InvalidInformationException(MessageKeys.ADMIN_ID_ALREADY_EXISTS);
            request.Password = _passwordService.RandomizePassword();
            var userId = await _userService.Create(request, UserRole.Admin);
            try
            {
                if (userId == null)
                    throw new InvalidOperationException(MessageKeys.USER_CREATION_FAILED);
                var adminProfile = new AdminProfile
                {
                    UserId = userId,
                    AdminId = request.AdminId,
                    Role = AdminRole.Admin.ToString(),
                    CreatedBy = performedByAdminUserId,
                    UpdatedBy = performedByAdminUserId,
                };
                await _adminProfileRepository.AddAsync(adminProfile);
                await _adminProfileRepository.SaveChangesAsync();
            }
            catch (Exception)
            {
                await _userService.Delete(userId);
                throw;
            }
        }

        public async Task Update(UpdateAdminProfileRequest request, string performedByAdminUserId)
        {
            var adminProfile = await _adminProfileRepository.FindIncludingUser(request.Id);
            if (adminProfile == null)
                throw new InvalidInformationException(MessageKeys.ADMIN_PROFILE_NOT_FOUND);

            adminProfile.AdminId = request.AdminId;
            adminProfile.Role = request.AdminRole;
            adminProfile.User.UpdatedAt = DateTime.UtcNow;
            adminProfile.UpdatedBy = performedByAdminUserId;
            _adminProfileRepository.Update(adminProfile);

            await _adminProfileRepository.SaveChangesAsync();
        }

        public async Task<PageResult<AdminProfileSummaryDto>> GetAdminProfilesPage(PageRequest pageRequest, GetAdminListRequest request)
        {
            var criterias = new List<Expression<Func<AdminProfile, bool>>>();
            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                criterias.Add(ap => ap.Role == request.Role);
            }
            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                criterias.Add(ap => ap.User.Status == request.Status);
            }
            criterias.Add(ap => 
                ap.AdminId.Contains(request.SearchCriteria?? string.Empty) ||
                ap.User.FullName.Contains(request.SearchCriteria ?? string.Empty) ||
                ap.User.Email.Contains(request.SearchCriteria ?? string.Empty) ||
                ap.User.Phone.Contains(request.SearchCriteria ?? string.Empty)
            );
            var criteriasArray = criterias.ToArray();

            var totalCount = await _adminProfileRepository.CountAsync(criteriasArray);
            var admins = await _adminProfileRepository.GetPageAsync(
                                        pageRequest.PageNumber, pageRequest.PageSize,
                                        criteriasArray, null, request.Order == OrderType.Asc.ToString());
            var items = new List<AdminProfileSummaryDto>();
            foreach (var admin in admins)
            {
                var adminIncludingUser = await _adminProfileRepository.FindIncludingUserReadOnly(admin.UserId);
                if(adminIncludingUser == null)
                    continue; // Skip if admin profile is not found
                items.Add(new AdminProfileSummaryDto(adminIncludingUser));
            }
            return new PageResult<AdminProfileSummaryDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageRequest.PageNumber,
                PageSize = pageRequest.PageSize,
            };
        }

        public async Task<List<AdminProfileSummaryDto>> GetAdminProfiles(GetAdminListRequest request)
        {
            var criterias = new List<Expression<Func<AdminProfile, bool>>>();
            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                criterias.Add(ap => ap.Role == request.Role);
            }
            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                criterias.Add(ap => ap.User.Status == request.Status);
            }
            if (!string.IsNullOrWhiteSpace(request.SearchCriteria))
            {
                criterias.Add(ap => ap.AdminId.Contains(request.SearchCriteria) ||
                ap.User.FullName.Contains(request.SearchCriteria) ||
                ap.User.Email.Contains(request.SearchCriteria) ||
                ap.User.Phone.Contains(request.SearchCriteria));
            }
            var admins = await _adminProfileRepository.GetAllAsync(criterias.ToArray(), null, request.Order == OrderType.Asc.ToString());
            var items = new List<AdminProfileSummaryDto>();
            foreach (var admin in admins)
            {
                var adminIncludingUser = await _adminProfileRepository.FindIncludingUserReadOnly(admin.UserId);
                if (adminIncludingUser == null)
                    continue;
                items.Add(new AdminProfileSummaryDto(adminIncludingUser));
            }
            return items;
        }

        public async Task<AdminProfileDetailsDto?> GetByAdminIdAsync(string adminId)
        {
            var adminProfile = await _adminProfileRepository.FindIncludingUserReadOnly([a => a.AdminId == adminId]) ?? 
                throw new InvalidInformationException(MessageKeys.ADMIN_PROFILE_NOT_FOUND);
            return new AdminProfileDetailsDto(adminProfile);
        }

        public async Task<AdminProfileDetailsDto?> GetByUserIdAsync(string userId)
        {
            var adminProfile = await _adminProfileRepository.FindIncludingUserReadOnly([a => a.UserId == userId]) ??
                throw new InvalidInformationException(MessageKeys.ADMIN_PROFILE_NOT_FOUND);
            return new AdminProfileDetailsDto(adminProfile);
        }

        public async Task<AdminRole> GetAdminRole(string userIdOrAdminId)
        {
            var adminProfile = await _adminProfileRepository.Find([a => a.UserId == userIdOrAdminId 
            || a.AdminId == userIdOrAdminId]) ?? throw new InvalidInformationException(MessageKeys.ADMIN_PROFILE_NOT_FOUND);
            return Enum.TryParse<AdminRole>(adminProfile.Role, out var role) ? role 
                : throw new InvalidDataException(MessageKeys.UNHANDLED_ADMIN_ROLE);    
        }

        public async Task<bool> IsAdminValid(string userIdOrAdminId)
        {
            var adminProfile = await _adminProfileRepository.Find([a => a.UserId == userIdOrAdminId
                || a.AdminId == userIdOrAdminId]);
            return adminProfile != null;
        }

        public async Task<bool> IsHeadAdminValid(string userId)
        {
            if(!await _userService.IsUserValid(userId))
                return false;
            var adminProfile = await _adminProfileRepository.Find([a => a.UserId == userId
                || a.AdminId == userId]);
            return adminProfile != null && adminProfile.Role == AdminRole.HeadAdmin.ToString();
        }
    }
}