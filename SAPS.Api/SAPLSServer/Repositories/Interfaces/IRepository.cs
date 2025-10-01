using SAPLSServer.Models;
using System.Linq.Expressions;

namespace SAPLSServer.Repositories.Interfaces
{
    public interface IRepository<T, TKey> where T : class where TKey : class
    {
        /// <summary>
        /// Retrieves all entities from the repository, optionally filtered and sorted.
        /// </summary>
        /// <param name="filters"></param>
        /// <param name="sortBy"></param>
        /// <param name="isAscending"></param>
        /// <returns></returns>
        Task<IEnumerable<T>> GetAllAsync(Expression<Func<T, bool>>[]? filters = null,
                                                Expression<Func<T, object>>? sortBy = null,
                                                bool isAscending = true);
        /// <summary>
        /// Retrieves a paginated collection of entities based on the specified filters and sorting options.
        /// </summary>
        /// <param name="pageNumber"></param>
        /// <param name="pageSize"></param>
        /// <param name="filters">Use to apply filter to the DbSet.</param>
        /// <param name="sortBy">Use to apply sorting to the DbSet</param>
        /// <param name="isAscending">Use to set the sort order.</param>
        /// <returns></returns>
        Task<IEnumerable<T>> GetPageAsync(int pageNumber = 1, int pageSize = 20,
                                        Expression<Func<T, bool>>[]? filters = null,
                                        Expression<Func<T, object>>? sortBy = null,
                                        bool isAscending = true);
        /// <summary>
        /// Retrieves an entity by its identifier.
        /// </summary>
        /// <param name="id">Entity's identifier.</param>
        /// <returns></returns>
        Task<T?> Find(TKey id);
        /// <summary>
        /// Finds an entity based on multiple criteria.
        /// </summary>
        /// <param name="criterias"></param>
        /// <returns></returns>
        Task<T?> Find(Expression<Func<T, bool>>[] criterias);
        /// <summary>
        /// Adds a new entity to the repository.
        /// </summary>
        /// <param name="entity"></param>
        /// <returns></returns>
        Task AddAsync(T entity);
        /// <summary>
        /// Adds a collection of entities to the repository.
        /// </summary>
        /// <param name="entities"></param>
        /// <returns></returns>
        Task AddRangeAsync(IEnumerable<T> entities);
        /// <summary>
        /// Updates an existing entity in the repository.
        /// </summary>
        /// <param name="entity"></param>
        void Update(T entity);
        /// <summary>
        /// Removes an entity from the repository.
        /// </summary>
        /// <param name="entity"></param>
        void Remove(T entity);
        /// <summary>
        /// Removes a collection of entities from the repository.
        /// </summary>
        /// <param name="entities"></param>
        void RemoveRange(IEnumerable<T> entities);
        /// <summary>
        /// Checks if an entity exists in the repository based on the specified predicate.
        /// </summary>
        /// <param name="predicate"></param>
        /// <returns></returns>
        Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate);
        /// <summary>
        /// Counts the number of entities in the repository that match the specified predicate.
        /// </summary>
        /// <param name="predicate"></param>
        /// <returns></returns>
        Task<int> CountAsync(Expression<Func<T, bool>>[]? criterias = null);
        /// <summary>
        /// Saves all changes made in the context to the database asynchronously.
        /// </summary>
        /// <returns></returns>
        Task<int> SaveChangesAsync();
    }
}
