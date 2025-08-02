using SAPS.Api.Dtos.Subscription;

namespace SAPS.Api.Service
{
    public interface ISubscriptionService
    {
        Task<IEnumerable<SubscriptionResponseDto>> GetAllSubscriptionsAsync();
        Task<SubscriptionResponseDto?> GetSubscriptionByIdAsync(string id);
        Task<SubscriptionResponseDto> CreateSubscriptionAsync(CreateSubscriptionDto createDto);
        Task<SubscriptionResponseDto> UpdateSubscriptionAsync(string id, UpdateSubscriptionDto updateDto);
    }
}