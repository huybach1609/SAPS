using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SAPLDesktopApp.Dtos
{
    public class ReturnDto<T>
    {
        public string Message { get; set; } = string.Empty;
        public T Data { get; set; } = default!;
    }
}
