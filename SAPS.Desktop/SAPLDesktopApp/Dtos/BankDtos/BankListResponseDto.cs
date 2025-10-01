using System.Collections.Generic;

namespace SAPLDesktopApp.Dtos.BankDtos
{
    public class BankListResponseDto
    {
        public string Code { get; set; } = null!;
        public string Desc { get; set; } = null!;
        public List<BankItem> Data { get; set; } = new();
    }
}
