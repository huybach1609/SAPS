using SAPLSServer.Models;

namespace SAPLSServer.Repositories.Interfaces
{
    public interface IIncidenceEvidenceRepository : IRepository<IncidenceEvidence, string>
    {
        Task<IncidenceEvidence?> FindIncludeAttachedFileReadonly(string attachedFileId);
    }
}
