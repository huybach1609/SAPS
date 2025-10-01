using System;
using System.Collections.Generic;

namespace SAPLDesktopApp.Dtos.BankDtos
{
    public class BankListStoreDto
    {
        public DateTime LastUpdated { get; set; }
        public List<BankItem> Data { get; set; } = new();
    }
}
