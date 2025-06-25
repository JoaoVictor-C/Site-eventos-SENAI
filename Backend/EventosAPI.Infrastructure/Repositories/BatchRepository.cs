using Microsoft.EntityFrameworkCore;
using EventosAPI.Domain.Entities;
using EventosAPI.Domain.Interfaces.Repositories;
using EventosAPI.Infrastructure.Data;

namespace EventosAPI.Infrastructure.Repositories
{    public class BatchRepository : BaseRepository<Batch>, IBatchRepository
    {
        public BatchRepository(ApplicationDbContext context) : base(context) { }        public override async Task<Batch?> GetByIdAsync(Guid id)
        {
            return await _dbSet
                .Include(b => b.Event)
                .Include(b => b.Tickets)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<IEnumerable<Batch>> GetEventBatchesAsync(Guid eventId)
        {
            return await _dbSet
                .Include(b => b.Tickets)
                .Where(b => b.EventId == eventId)
                .OrderBy(b => b.StartDate)
                .ToListAsync();
        }

        public async Task<Batch?> GetActiveBatchAsync(Guid eventId)
        {
            return await _dbSet
                .Include(b => b.Event)
                .Include(b => b.Tickets)
                .Where(b => b.EventId == eventId && b.IsActive && b.Stock > 0)
                .OrderBy(b => b.StartDate)
                .FirstOrDefaultAsync();
        }

        public async Task UpdateBatchStockAsync(Guid batchId, int quantity)
        {
            var batch = await GetByIdAsync(batchId);
            if (batch != null)
            {
                batch.Stock = quantity;
                await UpdateAsync(batch);
            }
        }
    }
}
