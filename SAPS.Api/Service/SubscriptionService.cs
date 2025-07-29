using AutoMapper;
using SAPS.Api.Dtos.Subscription;
using SAPS.Api.Models.Generated;
using SAPS.Api.Repository;

namespace SAPS.Api.Service
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly ISubscriptionRepository _subscriptionRepository;
        private readonly IMapper _mapper;

        public SubscriptionService(ISubscriptionRepository subscriptionRepository, IMapper mapper)
        {
            _subscriptionRepository = subscriptionRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<SubscriptionResponseDto>> GetAllSubscriptionsAsync()
        {
            var subscriptions = await _subscriptionRepository.GetAllSubscriptionsAsync();
            return _mapper.Map<IEnumerable<SubscriptionResponseDto>>(subscriptions);
        }

        public async Task<SubscriptionResponseDto?> GetSubscriptionByIdAsync(string id)
        {
            var subscription = await _subscriptionRepository.GetSubscriptionByIdAsync(id);
            return subscription != null ? _mapper.Map<SubscriptionResponseDto>(subscription) : null;
        }

        public async Task<SubscriptionResponseDto> CreateSubscriptionAsync(CreateSubscriptionDto createDto)
        {
            // Check for existing subscriptions with same name or duration and disable them
            await HandleDuplicateSubscriptionsAsync(createDto.Name, createDto.Duration);

            // Create new subscription
            var subscription = _mapper.Map<Subscription>(createDto);
            var createdSubscription = await _subscriptionRepository.CreateSubscriptionAsync(subscription);
            
            return _mapper.Map<SubscriptionResponseDto>(createdSubscription);
        }

        public async Task<SubscriptionResponseDto> UpdateSubscriptionAsync(string id, UpdateSubscriptionDto updateDto)
        {
            var existingSubscription = await _subscriptionRepository.GetSubscriptionByIdAsync(id);
            if (existingSubscription == null)
            {
                throw new KeyNotFoundException($"Subscription with ID {id} not found");
            }

            // Update subscription properties first
            if (!string.IsNullOrEmpty(updateDto.Name))
                existingSubscription.Name = updateDto.Name;
            
            if (!string.IsNullOrEmpty(updateDto.Description))
                existingSubscription.Description = updateDto.Description;
            
            if (updateDto.Price.HasValue)
                existingSubscription.Price = updateDto.Price.Value;
            
            if (!string.IsNullOrEmpty(updateDto.Status))
                existingSubscription.Status = updateDto.Status;

            // After updating, check if there are any other subscriptions with the same name and disable them
            if (!string.IsNullOrEmpty(updateDto.Name))
            {
                await HandleDuplicateSubscriptionsByNameForUpdateAsync(updateDto.Name, id);
            }

            var updatedSubscription = await _subscriptionRepository.UpdateSubscriptionAsync(existingSubscription);
            return _mapper.Map<SubscriptionResponseDto>(updatedSubscription);
        }

        private async Task HandleDuplicateSubscriptionsAsync(string name, long duration)
        {
            // Get subscriptions with same name
            var duplicatesByName = await _subscriptionRepository.GetSubscriptionsByNameAsync(name);
            
            // Get subscriptions with same duration
            var duplicatesByDuration = await _subscriptionRepository.GetSubscriptionsByDurationAsync(duration);
            
            // Combine and remove duplicates
            var allDuplicates = duplicatesByName.Concat(duplicatesByDuration)
                .GroupBy(s => s.Id)
                .Select(g => g.First())
                .ToList();

            if (allDuplicates.Any())
            {
                await _subscriptionRepository.DisableSubscriptionsAsync(allDuplicates);
            }
        }

        private async Task HandleDuplicateSubscriptionsByNameForUpdateAsync(string name, string excludeId)
        {
            // Get ALL subscriptions with the same name (including both active and inactive)
            var duplicates = await _subscriptionRepository.GetAllSubscriptionsByNameAsync(name);
            
            // Exclude the current subscription being updated and disable all others with the same name
            var duplicatesToDisable = duplicates.Where(s => s.Id != excludeId).ToList();
            
            if (duplicatesToDisable.Any())
            {
                await _subscriptionRepository.DisableSubscriptionsAsync(duplicatesToDisable);
            }
        }
    }
}