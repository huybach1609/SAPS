using SAPLSServer.Models;

namespace SAPLSServer.Repositories.Interfaces
{
    public interface IWhiteListRepository : IRepository<WhiteList, WhiteListKey>
    {
        /// <summary>
        /// Retrieves a whitelist entity, including associated user information, based on the specified identifiers, in a read-only context.
        /// </summary>
        /// <param name="key">An array of unique identifiers used to locate the whitelist entities. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="WhiteList"/>
        /// entity  with associated user information, or <see langword="null"/> if no matching entity is found.</returns>
        Task<WhiteList?> FindIncludingClientReadOnly(WhiteListKey key);
        /// <summary>
        /// Retrieves a whitelist entity, including associated user information, based on the specified identifiers.
        /// </summary>
        /// <param name="key">An array of unique identifiers used to locate the whitelist entities. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="WhiteList"/>
        /// entity  with associated user information, or <see langword="null"/> if no matching entity is found.</returns>
        Task<WhiteList?> FindIncludingClient(WhiteListKey key);
    }
    public class WhiteListKey
    {
        public string ParkingLotId = null!;
        public string ClientId = null!;
    }
}
