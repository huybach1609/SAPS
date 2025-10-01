using SAPLSServer.Models;

namespace SAPLSServer.Repositories.Interfaces
{
    public interface IRequestAttachedFileRepository : IRepository<RequestAttachedFile, string>
    {
        Task<RequestAttachedFile?> FindIncludeAttachedFileReadonly(string attachedFileId);
    }
}
