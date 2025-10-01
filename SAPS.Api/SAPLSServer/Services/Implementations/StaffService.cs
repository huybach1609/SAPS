using SAPLSServer.Constants;
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
    public class StaffService : IStaffService
    {
        private readonly IStaffProfileRepository _staffProfileRepository;
        private readonly IUserService _userService;
        private readonly IPasswordService _passwordService;

        public StaffService(IUserService userService, IStaffProfileRepository staffProfileRepository,
            IPasswordService passwordService)
        {
            _userService = userService;
            _passwordService = passwordService;
            _staffProfileRepository = staffProfileRepository;
        }

        public async Task Create(CreateStaffProfileRequest request)
        {
            // Check for unique StaffId
            bool staffIdExists = await _staffProfileRepository.ExistsAsync(s => s.StaffId == request.StaffId);
            if (staffIdExists)
                throw new InvalidInformationException(MessageKeys.STAFF_ID_ALREADY_EXISTS);

            request.Password = _passwordService.RandomizePassword();
            var userId = await _userService.Create(request, UserRole.Staff);
            try
            {
                var staffProfile = new StaffProfile
                {
                    UserId = userId,
                    StaffId = request.StaffId,
                    ParkingLotId = request.ParkingLotId
                };
                await _staffProfileRepository.AddAsync(staffProfile);
                await _staffProfileRepository.SaveChangesAsync();
            }
            catch (Exception)
            {
                await _userService.Delete(userId); // Rollback user creation if staff profile creation fails
                throw;
            }
        }

        public async Task Update(UpdateStaffProfileRequest request)
        {
            var staffProfile = await _staffProfileRepository.FindIncludingUser([sp => sp.UserId == request.Id]);
            if (staffProfile == null)
                throw new InvalidInformationException(MessageKeys.STAFF_PROFILE_NOT_FOUND);

            staffProfile.StaffId = request.StaffId;
            staffProfile.User.UpdatedAt = DateTime.UtcNow;
            _staffProfileRepository.Update(staffProfile);
            await _staffProfileRepository.SaveChangesAsync();
        }

        public async Task<PageResult<StaffProfileSummaryDto>> GetStaffProfilesPage(PageRequest pageRequest, GetStaffListRequest request)
        {
            var criterias = new List<Expression<Func<StaffProfile, bool>>>();
            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                criterias.Add(sp => sp.User.Status == request.Status);
            }
            if (!string.IsNullOrWhiteSpace(request.ParkingLotId))
            {
                criterias.Add(sp => sp.ParkingLotId == request.ParkingLotId);
            }
            if (!string.IsNullOrWhiteSpace(request.SearchCriteria))
            {
                criterias.Add(sp => sp.StaffId.Contains(request.SearchCriteria) ||
                sp.User.FullName.Contains(request.SearchCriteria) ||
                sp.User.Email.Contains(request.SearchCriteria) ||
                sp.User.Phone.Contains(request.SearchCriteria));
            }
            var criteriasArray = criterias.ToArray();

            var totalCount = await _staffProfileRepository.CountAsync(criteriasArray);
            var staffs = await _staffProfileRepository.GetPageAsync(
                                        pageRequest.PageNumber, pageRequest.PageSize,
                                        criteriasArray, null, request.Order == OrderType.Asc.ToString());
            var items = new List<StaffProfileSummaryDto>();
            foreach (var staff in staffs)
            {
                var staffIncludingUser = await _staffProfileRepository.FindIncludingUserReadOnly(staff.UserId);
                if (staffIncludingUser == null)
                    continue; // Skip if staff profile is not found
                items.Add(new StaffProfileSummaryDto(staffIncludingUser));
            }
            return new PageResult<StaffProfileSummaryDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageRequest.PageNumber,
                PageSize = pageRequest.PageSize,
            };
        }

        public async Task<List<StaffProfileSummaryDto>> GetStaffProfiles(GetStaffListRequest request)
        {
            var criterias = new List<Expression<Func<StaffProfile, bool>>>();
            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                criterias.Add(sp => sp.User.Status == request.Status);
            }
            if (!string.IsNullOrWhiteSpace(request.ParkingLotId))
            {
                criterias.Add(sp => sp.ParkingLotId == request.ParkingLotId);
            }
            if (!string.IsNullOrWhiteSpace(request.SearchCriteria))
            {
                criterias.Add(sp => sp.StaffId.Contains(request.SearchCriteria) ||
                sp.User.FullName.Contains(request.SearchCriteria) ||
                sp.User.Email.Contains(request.SearchCriteria) ||
                sp.User.Phone.Contains(request.SearchCriteria));
            }
            var staffs = await _staffProfileRepository.GetAllAsync(criterias.ToArray(), null, request.Order == OrderType.Asc.ToString());
            var items = new List<StaffProfileSummaryDto>();
            foreach (var staff in staffs)
            {
                var staffIncludingUser = await _staffProfileRepository.FindIncludingUserReadOnly(staff.UserId);
                if (staffIncludingUser == null)
                    continue; // Skip if staff profile is not found
                items.Add(new StaffProfileSummaryDto(staffIncludingUser));
            }
            return items;
        }

        public async Task<StaffProfileDetailsDto?> FindByStaffId(string staffId)
        {
            var staffProfile = await _staffProfileRepository.FindIncludingUserReadOnly([s => s.StaffId == staffId])
                ?? throw new InvalidInformationException(MessageKeys.STAFF_PROFILE_NOT_FOUND);
            return new StaffProfileDetailsDto(staffProfile);
        }

        public async Task<StaffProfileDetailsDto?> FindByUserId(string userId)
        {
            var staffProfile = await _staffProfileRepository.FindIncludingUserReadOnly([s => s.UserId == userId])
                ?? throw new InvalidInformationException(MessageKeys.STAFF_PROFILE_NOT_FOUND);
            return new StaffProfileDetailsDto(staffProfile);
        }

        public async Task<string> GetParkingLotId(string userIdOrstaffId)
        {
            // Check if the input is a user ID or staff ID
            var staffProfile = await _staffProfileRepository.Find([u => u.StaffId == userIdOrstaffId
                                                                     || u.UserId == userIdOrstaffId])
                ?? throw new InvalidInformationException(MessageKeys.STAFF_PROFILE_NOT_FOUND);
            return staffProfile.ParkingLotId;
        }

        public async Task<bool> IsStaffValid(string userId)
        {
            if (!await _userService.IsUserValid(userId))
            {
                return false;
            }
            return await _staffProfileRepository.ExistsAsync(s => s.UserId == userId);
        }

        public async Task<bool> IsStaffInCurrentShift(string userId)
        {
            // Get the staff profile with assigned shifts
            var staffProfile = await _staffProfileRepository.FindIncludingShiftReadOnly(userId);
            if (staffProfile == null || staffProfile.ParkingLotShifts == null || !staffProfile.ParkingLotShifts.Any())
                return false;

            var now = DateTime.UtcNow;
            int currentMinutes = now.Hour * 60 + now.Minute;

            foreach (var shift in staffProfile.ParkingLotShifts)
            {
                // Check status
                if (shift.Status.Trim() != ParkingLotShiftStatus.Active.ToString())
                    continue;

                // Check if today is in DayOfWeeks
                if (string.IsNullOrWhiteSpace(shift.DayOfWeeks))
                    continue;
                var days = shift.DayOfWeeks.Split(',').Select(d => d.Trim());
                if (!days.Contains(((int)now.DayOfWeek).ToString()))
                    continue;

                // Check time range
                if (shift.StartTime <= currentMinutes && shift.EndTime >= currentMinutes)
                    return true;
            }
            return false;
        }
    }
}