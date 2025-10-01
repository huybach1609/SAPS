using SAPLSServer.Models;

namespace SAPLSServer.Repositories.Interfaces
{
    public interface IShiftDiaryRepository : IRepository<ShiftDiary, string>
    {
        /// <summary>
        /// Retrieves a shift diary associated with the specified ID, including sender data, in a
        /// read-only context.
        /// </summary>
        /// <remarks>This method operates in a read-only context, ensuring that no modifications are made
        /// to the underlying data.</remarks>
        /// <param name="id">The unique identifier of the shift diary to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="ShiftDiary"/>
        /// object with associated sender data if found; otherwise, <see langword="null"/>.</returns>
        Task<ShiftDiary?> FindIncludingSenderReadOnly(string id);
        /// <summary>
        /// Retrieves a shift diary associated with the specified ID, including sender data.
        /// </summary>
        /// <remarks>This method operates in a read-only context, ensuring that no modifications are made
        /// to the underlying data.</remarks>
        /// <param name="id">The unique identifier of the shift diary to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="ShiftDiary"/>
        /// object with associated sender data if found; otherwise, <see langword="null"/>.</returns>
        Task<ShiftDiary?> FindIncludingSender(string id);
    }
}
