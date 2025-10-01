using SAPLSServer.Models;

namespace SAPLSServer.Repositories.Interfaces
{
    public interface IIncidenceReportRepository : IRepository<IncidenceReport, string>
    {
        /// <summary>
        /// Retrieves an incidence report associated with the specified ID, including sender information, in a
        /// read-only context.
        /// </summary>
        /// <remarks>This method operates in a read-only context, ensuring that no modifications are made
        /// to the underlying data.</remarks>
        /// <param name="id">The unique identifier of the incidence report to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="IncidenceReport"/>
        /// object with associated sender information if found; otherwise, <see langword="null"/>.</returns>
        Task<IncidenceReport?> FindIncludeSenderInformationReadOnly(string id);
        /// <summary>
        /// Retrieves an incidence report associated with the specified ID, including sender information.
        /// </summary>
        /// <remarks>This method operates in a read-only context, ensuring that no modifications are made
        /// to the underlying data.</remarks>
        /// <param name="id">The unique identifier of the incidence report to be retrieved. Cannot be null or empty.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the <see cref="IncidenceReport"/>
        /// object with associated sender information if found; otherwise, <see langword="null"/>.</returns>
        Task<IncidenceReport?> FindIncludeSenderInformation(string id);
    }
}
