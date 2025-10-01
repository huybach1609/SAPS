using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.ParkingLotShiftDtos;
using SAPLSServer.Exceptions;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Implementations;
using SAPLSServer.Repositories.Interfaces;
using SAPLSServer.Services.Interfaces;


namespace SAPLSServer.Services.Implementations
{
    public class ParkingLotShiftService : IParkingLotShiftService
    {
        private readonly IParkingLotShiftRepository _shiftRepository;
        private readonly IStaffProfileRepository _staffProfileRepository;
        private readonly IParkingLotService _parkingLotService;

        public ParkingLotShiftService(IParkingLotShiftRepository shiftRepository, 
            IParkingLotService parkingLotService,
            IStaffProfileRepository staffProfileRepository)
        {
            _shiftRepository = shiftRepository;
            _parkingLotService = parkingLotService;
            _staffProfileRepository = staffProfileRepository;
        }

        public async Task<List<ParkingLotShiftDto>> GetShiftsByParkingLotAsync(string parkingLotId)
        {
            var shifts = await _shiftRepository.GetByParkingLotIdAsync(parkingLotId);
            return shifts.Select(MapToDto).ToList();
        }

        public async Task<ParkingLotShiftDto?> GetShiftByIdAsync(string id)
        {
            var shift = await _shiftRepository.FindWithStaffAsync(id);
            return shift == null ? null : MapToDto(shift);
        }

        public async Task<ParkingLotShiftDto> CreateShiftAsync(CreateParkingLotShiftRequest request, string performerId)
        {
            if (!await _parkingLotService.IsParkingLotOwner(request.ParkingLotId, performerId))
                throw new UnauthorizedAccessException(MessageKeys.UNAUTHORIZED_ACCESS);

            var existingShifts = await _shiftRepository.GetByParkingLotIdAsync(request.ParkingLotId);
            foreach (var existingShift in existingShifts)
            {
                foreach (var staffId in request.StaffIds ?? new List<string>())
                {
                    bool overlap = (request.EndTime <= existingShift.StartTime && request.StartTime >= existingShift.EndTime) &&
                               existingShift.DayOfWeeks.Split(',').Any(d => request.DayOfWeeks.Split(',').Contains(d)) &&
                               existingShift.StaffUsers.Any(s => s.StaffId == s.StaffId);
                    if (overlap)
                        throw new InvalidInformationException(MessageKeys.SHIFT_TIME_OVERLAP);
                }
            }

            var shift = new ParkingLotShift
            {
                Id = Guid.NewGuid().ToString(),
                ParkingLotId = request.ParkingLotId,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                ShiftType = request.ShiftType,
                DayOfWeeks = request.DayOfWeeks ?? string.Empty,
                Status = request.Status,
                Note = request.Notes,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            if (request.StaffIds != null)
            {
                foreach (var staffId in request.StaffIds)
                {
                    var staffProfile = await _staffProfileRepository.Find([s => s.StaffId == staffId]);
                    if (staffProfile != null)
                    {
                        shift.StaffUsers.Add(staffProfile);
                    }
                }
            }
            await _shiftRepository.AddAsync(shift);
            await _shiftRepository.SaveChangesAsync();
            
            return MapToDto(shift);
        }

        public async Task<bool> UpdateShiftAsync(UpdateParkingLotShiftRequest request, string performerId)
        {
            var shift = await _shiftRepository.FindWithStaffAsync(request.Id);
            if (shift == null)
                throw new InvalidInformationException("Shift not found.");

            if (!await _parkingLotService.IsParkingLotOwner(shift.ParkingLotId, performerId))
                throw new UnauthorizedAccessException(MessageKeys.UNAUTHORIZED_ACCESS);

            if (request.StartTime.HasValue) shift.StartTime = request.StartTime.Value;
            if (request.EndTime.HasValue) shift.EndTime = request.EndTime.Value;
            if (request.ShiftType != null) shift.ShiftType = request.ShiftType;
            if (request.DayOfWeeks != null) shift.DayOfWeeks = request.DayOfWeeks;
            if (request.Status != null) shift.Status = request.Status;
            if (request.Notes != null) shift.Note = request.Notes;
            shift.UpdatedAt = DateTime.UtcNow;

            _shiftRepository.Update(shift);
            await _shiftRepository.SaveChangesAsync();
            if (request.StaffIds != null)
            {
                shift.StaffUsers.Clear();
                await _shiftRepository.SaveChangesAsync();
                foreach (var staffId in request.StaffIds)
                {
                    var staffProfile = await _staffProfileRepository.Find([s => s.StaffId == staffId && s.ParkingLotId == shift.ParkingLotId]);
                    if (staffProfile != null)
                    {
                        shift.StaffUsers.Add(staffProfile);
                    }
                }
                _shiftRepository.Update(shift);
                await _shiftRepository.SaveChangesAsync();
            }
            return true;
        }

        public async Task<bool> DeleteShiftAsync(string id, string performerId)
        {
            var shift = await _shiftRepository.Find(id);
            if (shift == null)
                throw new InvalidInformationException(MessageKeys.SHIFT_NOT_FOUND);

            if (!await _parkingLotService.IsParkingLotOwner(shift.ParkingLotId, performerId))
                throw new UnauthorizedAccessException(MessageKeys.UNAUTHORIZED_ACCESS);

            _shiftRepository.Remove(shift);
            await _shiftRepository.SaveChangesAsync();
            return true;
        }

        private static ParkingLotShiftDto MapToDto(ParkingLotShift shift)
        {
            return new ParkingLotShiftDto
            {
                Id = shift.Id,
                ParkingLotId = shift.ParkingLotId,
                StartTime = shift.StartTime,
                EndTime = shift.EndTime,
                ShiftType = shift.ShiftType,
                DayOfWeeks = shift.DayOfWeeks,
                Status = shift.Status,
                Notes = shift.Note,
                CreatedAt = shift.CreatedAt,
                UpdatedAt = shift.UpdatedAt,
                StaffIds = shift.StaffUsers.Select(s => s.StaffId).ToList(),
            };
        }
    }
}