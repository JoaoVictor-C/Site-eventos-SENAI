using EventosAPI.Domain.Entities;

namespace EventosAPI.Domain.Interfaces.Repositories
{
    public interface IBatchRepository : IBaseRepository<Batch>
    {
        Task<IEnumerable<Batch>> GetEventBatchesAsync(Guid eventId);
        Task<Batch?> GetActiveBatchAsync(Guid eventId);
        Task UpdateBatchStockAsync(Guid batchId, int quantity);
    }
}
