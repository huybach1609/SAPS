using SAPLSServer.Constants;
using SAPLSServer.DTOs.Concrete.SubscriptionDtos;
using SAPLSServer.DTOs.PaginationDto;
using SAPLSServer.Exceptions;
using SAPLSServer.Models;
using SAPLSServer.Repositories.Interfaces;
using SAPLSServer.Services.Interfaces;
using System.Linq.Expressions;

namespace SAPLSServer.Services.Implementations
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly ISubscriptionRepository _subscriptionRepository;

        public SubscriptionService(ISubscriptionRepository subscriptionRepository)
        {
            _subscriptionRepository = subscriptionRepository;
        }

        public async Task<List<SubscriptionSummaryDto>> GetListAsync(GetSubscriptionListRequest request)
        {
            var criterias = new List<Expression<Func<Subscription, bool>>>();
            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                criterias.Add(s => s.Status == request.Status);
            }
            var subscriptions = await _subscriptionRepository.GetAllAsync(criterias.ToArray());
            var items = new List<SubscriptionSummaryDto>();
            foreach (var subscription in subscriptions)
            {
                if (subscription.CreatedBy != null)
                {
                    var subscriptionIncludedUpdatedBy = await _subscriptionRepository.FindIncludUpdatedBy(subscription.Id);
                    if (subscriptionIncludedUpdatedBy == null)
                    {
                        continue;
                    }
                    items.Add(new SubscriptionSummaryDto(subscriptionIncludedUpdatedBy));
                }
                else
                {
                    items.Add(new SubscriptionSummaryDto(subscription));
                }
            }
            return items;
        }

        public async Task<PageResult<SubscriptionSummaryDto>> GetPageAsync(PageRequest pageRequest, GetSubscriptionListRequest request)
        {
            var criterias = new List<Expression<Func<Subscription, bool>>>();
            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                criterias.Add(s => s.Status == request.Status);
            }
            var criteriasArray = criterias.ToArray();

            var totalCount = await _subscriptionRepository.CountAsync(criteriasArray);
            var subscriptions = await _subscriptionRepository.GetPageAsync(
                pageRequest.PageNumber,
                pageRequest.PageSize,
                criteriasArray,
                null,
                request.Order == OrderType.Asc.ToString()
            );

            var items = new List<SubscriptionSummaryDto>();
            foreach (var subscription in subscriptions)
            {
                var subscriptionIncludedUpdatedBy = await _subscriptionRepository.FindIncludUpdatedBy(subscription.Id);
                if (subscriptionIncludedUpdatedBy == null)
                {
                    continue;
                }
                items.Add(new SubscriptionSummaryDto(subscriptionIncludedUpdatedBy));
            }
            return new PageResult<SubscriptionSummaryDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageRequest.PageNumber,
                PageSize = pageRequest.PageSize,
            };
        }

        public async Task<SubscriptionDetailsDto?> GetDetailsAsync(string id)
        {
            var subscription = await _subscriptionRepository.Find(id);
            if (subscription == null)
                return null;
            return new SubscriptionDetailsDto(subscription);
        }

        public async Task CreateAsync(CreateSubscriptionRequest request, string adminId)
        {
            if (await _subscriptionRepository.ExistsAsync(c => c.Name == request.Name))
                throw new InvalidInformationException(MessageKeys.SUBSCRIPTION_NAME_EXISTS);
            var subscription = new Subscription
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.Name,
                Description = request.Note,
                Duration = (long)TimeSpan.FromDays(request.Duration).TotalMilliseconds,
                Price = request.Price,
                Status = request.Status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = adminId,
                UpdatedBy = adminId
            };

            await _subscriptionRepository.AddAsync(subscription);
            await _subscriptionRepository.SaveChangesAsync();
        }

        public async Task UpdateStatusAsync(UpdateSubscriptionStatusRequest request, string adminId)
        {
            var subscription = await _subscriptionRepository.Find(request.Id);
            if (subscription == null)
                throw new InvalidInformationException(MessageKeys.SUBSCRIPTION_NOT_FOUND);

            subscription.Status = request.Status;
            subscription.UpdatedAt = DateTime.UtcNow;
            subscription.UpdatedBy = adminId;

            _subscriptionRepository.Update(subscription);
            await _subscriptionRepository.SaveChangesAsync();
        }
        public async Task<long> GetDurationOfSubscription(string subscriptionId)
        {
            var subscription = await _subscriptionRepository.Find(subscriptionId);
            if (subscription == null)
                throw new InvalidInformationException(MessageKeys.SUBSCRIPTION_NOT_FOUND);
            return subscription.Duration;
        }

        public async Task<double> GetCostOfSubscription(string subscriptionId)
        {
            var subscription =  await _subscriptionRepository.Find(subscriptionId);
            if (subscription == null)
                throw new InvalidInformationException(MessageKeys.SUBSCRIPTION_NOT_FOUND);
            return subscription.Price;
        }

        public async Task UpdateAsync(UpdateSubscriptionRequest request, string adminId)
        {
            var subscription = await _subscriptionRepository.Find(request.Id);
            if (subscription == null)
                throw new InvalidInformationException(MessageKeys.SUBSCRIPTION_NOT_FOUND);
            subscription.Status = request.Status;
            subscription.Name = request.Name;
            subscription.Description = request.Note;
            subscription.Duration = (long)TimeSpan.FromDays(request.Duration).TotalMilliseconds;
            subscription.Price = request.Price;
            subscription.UpdatedAt = DateTime.UtcNow;
            subscription.UpdatedBy = adminId;
            _subscriptionRepository.Update(subscription);
            await _subscriptionRepository.SaveChangesAsync();
        }
    }
}