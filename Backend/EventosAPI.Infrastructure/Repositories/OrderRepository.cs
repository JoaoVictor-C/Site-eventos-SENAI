using Microsoft.EntityFrameworkCore;
using EventosAPI.Domain.Entities;
using EventosAPI.Domain.Interfaces.Repositories;
using EventosAPI.Infrastructure.Data;

namespace EventosAPI.Infrastructure.Repositories
{
    public class OrderRepository : BaseRepository<Order>, IOrderRepository
    {
        public OrderRepository(ApplicationDbContext context) : base(context) { }

        public override async Task<Order?> GetByIdAsync(Guid id)
        {
            return await _dbSet
                .Include(o => o.User)
                .Include(o => o.Event)
                .Include(o => o.ValidatedByUser)
                .Include(o => o.Tickets)
                    .ThenInclude(t => t.Batch)
                        .ThenInclude(b => b.Event)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public override async Task<IEnumerable<Order>> GetAllAsync()
        {
            return await _dbSet
                .Include(o => o.User)
                .Include(o => o.Event)
                .Include(o => o.Tickets)
                    .ThenInclude(t => t.Batch)
                        .ThenInclude(b => b.Event)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Order>> GetUserOrdersAsync(Guid userId)
        {
            return await _dbSet
                .Include(o => o.User)
                .Include(o => o.Event)
                .Include(o => o.Tickets)
                    .ThenInclude(t => t.Batch)
                        .ThenInclude(b => b.Event)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Order>> GetEventOrdersAsync(Guid eventId)
        {
            return await _dbSet
                .Include(o => o.User)
                .Include(o => o.Event)
                .Include(o => o.Tickets)
                    .ThenInclude(t => t.Batch)
                .Where(o => o.EventId == eventId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }
    }
}