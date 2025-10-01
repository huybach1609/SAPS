using SAPLDesktopApp.Dtos.BankDtos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Services
{
    public interface IBankService : IDisposable
    {
        Task<List<BankItem>> GetBanks();
        Task<BankItem?> GetBank(string bin);
    }
}
