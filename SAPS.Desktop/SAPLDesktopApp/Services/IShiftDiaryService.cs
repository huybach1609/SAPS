using SAPLDesktopApp.DTOs.Concrete.ShiftDiaryDtos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    public interface IShiftDiaryService : IDisposable
    {
        Task CreateShiftDiaryAsync(CreateShiftDiaryRequest request);
        Task<List<ShiftDiarySummaryDto>> GetShiftDiaryListAsync(GetShiftDiaryListRequest request);
        Task<ShiftDiaryDetailsDto> GetShiftDiaryDetailsAsync(string shiftDiaryId);
    }
}