using SAPLSServer.Constants;
using System.ComponentModel.DataAnnotations;

namespace SAPLSServer.DTOs.Base
{
    public abstract class GetListRequest
    {
        [EnumDataType(typeof(OrderType), ErrorMessage = MessageKeys.INVALID_ORDER_BY)]
        public string? Order { get; set; } = OrderType.Asc.ToString();
        public string? SortBy { get; set; }
        public string? SearchCriteria { get; set; }
    }
}