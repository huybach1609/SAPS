using System.ComponentModel.DataAnnotations;
using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.ParkingFeeScheduleDtos;
using SAPLSServer.Exceptions;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using SAPLSServer.Services.Interfaces;

namespace SAPLSServer.Services.Implementations
{
    public class ParkingFeeScheduleService : IParkingFeeScheduleService
    {
        private readonly IParkingFeeScheduleRepository _parkingFeeScheduleRepository;
        private readonly IParkingLotService _parkingLotService;

        public ParkingFeeScheduleService(
            IParkingFeeScheduleRepository repository,
            IParkingLotService parkingLotService)
        {
            _parkingFeeScheduleRepository = repository;
            _parkingLotService = parkingLotService;
        }

        public async Task<ParkingFeeScheduleDto> CreateAsync(CreateParkingFeeScheduleRequest request, string performerId)
        {
            if(!await _parkingLotService.IsParkingLotValid(request.ParkingLotId))
                throw new InvalidInformationException(MessageKeys.PARKING_LOT_NOT_FOUND);
            if (!await _parkingLotService.IsParkingLotOwner(request.ParkingLotId, performerId))
                throw new UnauthorizedAccessException(MessageKeys.UNAUTHORIZED_ACCESS);

            var exists = await _parkingFeeScheduleRepository.GetAllAsync(filters: [s => s.ParkingLotId == request.ParkingLotId]);
            foreach(var existedSchedule in exists)
            {
                bool overlap = (request.EndTime <= existedSchedule.StartTime && request.StartTime >= existedSchedule.EndTime) &&
                    existedSchedule.DayOfWeeks.Split(',').Any(d => request.DayOfWeeks.Split(',').Contains(d)) &&
                    existedSchedule.ForVehicleType == request.ForVehicleType;
                if (overlap)
                    throw new InvalidInformationException(MessageKeys.FEE_SCHEDULE_TIME_OVERLAP);
            }

            var schedule = new ParkingFeeSchedule
            {
                Id = Guid.NewGuid().ToString(),
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                InitialFee = request.InitialFee,
                InitialMinutes = request.InitialMinutes,
                AdditionalFee = request.AdditionalFee ?? 0,
                AdditionalMinutes = request.AdditionalMinutes ?? 0,
                DayOfWeeks = request.DayOfWeeks,
                IsActive = true,
                UpdatedAt = DateTime.UtcNow,
                ForVehicleType = request.ForVehicleType,
                ParkingLotId = request.ParkingLotId
            };
            await _parkingFeeScheduleRepository.AddAsync(schedule);
            await _parkingFeeScheduleRepository.SaveChangesAsync();
            return MapToDto(schedule);
        }

        public async Task<ParkingFeeScheduleDto> UpdateAsync(UpdateParkingFeeScheduleRequest request, string performerId)
        {
            var schedule = await _parkingFeeScheduleRepository.Find(request.Id);
            if (schedule == null)
                throw new InvalidInformationException(MessageKeys.PARKING_FEE_SCHEDULE_NOT_FOUND);

            if (!await _parkingLotService.IsParkingLotOwner(request.ParkingLotId, performerId))
                throw new UnauthorizedAccessException(MessageKeys.UNAUTHORIZED_ACCESS);

            schedule.StartTime = request.StartTime;
            schedule.EndTime = request.EndTime;
            schedule.InitialFee = request.InitialFee;
            schedule.InitialMinutes = request.InitialMinutes;
            schedule.AdditionalFee = request.AdditionalFee ?? 0;
            schedule.AdditionalMinutes = request.AdditionalMinutes ?? 0;
            schedule.DayOfWeeks = request.DayOfWeeks;
            schedule.IsActive = request.IsActive;
            schedule.ForVehicleType = request.ForVehicleType;
            schedule.UpdatedAt = DateTime.UtcNow;
            schedule.ParkingLotId = request.ParkingLotId;

            _parkingFeeScheduleRepository.Update(schedule);
            await _parkingFeeScheduleRepository.SaveChangesAsync();
            return MapToDto(schedule);
        }

        public async Task<List<ParkingFeeScheduleDto>> GetListByParkingLotAsync(string parkingLotId, string performerId)
        {
            if (!await _parkingLotService.IsParkingLotOwner(parkingLotId, performerId))
                throw new UnauthorizedAccessException(MessageKeys.UNAUTHORIZED_ACCESS);

            var schedules = await _parkingFeeScheduleRepository.GetAllAsync([s => s.ParkingLotId == parkingLotId]);
            return schedules.Select(MapToDto).ToList();
        }

        public async Task<ParkingFeeScheduleDto?> GetByIdAsync(string id, string performerId)
        {
            var schedule = await _parkingFeeScheduleRepository.Find(id);
            if (schedule == null)
                return null;

            if (!await _parkingLotService.IsParkingLotOwner(schedule.ParkingLotId, performerId))
                throw new UnauthorizedAccessException(MessageKeys.UNAUTHORIZED_ACCESS);

            return MapToDto(schedule);
        }

        private static ParkingFeeScheduleDto MapToDto(ParkingFeeSchedule schedule)
        {
            return new ParkingFeeScheduleDto
            {
                Id = schedule.Id,
                StartTime = schedule.StartTime,
                EndTime = schedule.EndTime,
                InitialFee = schedule.InitialFee,
                InitialMinutes = schedule.InitialMinutes,
                AdditionalFee = schedule.AdditionalFee,
                AdditionalMinutes = schedule.AdditionalMinutes,
                DayOfWeeks = schedule.DayOfWeeks,
                IsActive = schedule.IsActive,
                UpdatedAt = schedule.UpdatedAt,
                ForVehicleType = schedule.ForVehicleType,
                ParkingLotId = schedule.ParkingLotId
            };
        }

        public async Task<string> GetParkingLotCurrentFeeSchedule(string parkingLotId, VehicleType vehicleType)
        {
            var now = DateTime.UtcNow;
            int currentMinutes = now.Hour * 60 + now.Minute;

            // Fetch all schedules first, then filter in-memory
            var schedules = await _parkingFeeScheduleRepository.GetAllAsync([
                s => s.ParkingLotId == parkingLotId
            && s.IsActive
            && !string.IsNullOrEmpty(s.DayOfWeeks)
            && s.StartTime <= currentMinutes
            && s.EndTime >= currentMinutes
            && s.ForVehicleType == vehicleType.ToString()
            ]);

            var currentSchedule = schedules
                .FirstOrDefault(s => s.DayOfWeeks.Split(',').Contains(((int)now.DayOfWeek).ToString()));

            return currentSchedule?.Id ?? string.Empty;
        }

        public async Task<decimal> CalculateParkingSessionFee(string scheduleId, DateTime startTime, DateTime endTime)
        {
            var schedule = await _parkingFeeScheduleRepository.Find([ps => ps.Id == scheduleId]);
            if (schedule == null)
                throw new InvalidInformationException(MessageKeys.PARKING_FEE_SCHEDULE_NOT_FOUND);
            var totalMinutes = (endTime - startTime).TotalMinutes;
            
            var additionalMinutes = Math.Max(schedule.AdditionalMinutes > 0
                ? (int)((totalMinutes - schedule.InitialMinutes) / schedule.AdditionalMinutes)
                : 0, 0);

            return schedule.InitialFee + additionalMinutes * schedule.AdditionalFee;
        }
    }
}