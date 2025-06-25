using Microsoft.EntityFrameworkCore;
using EventosAPI.Domain.Entities;
using EventosAPI.Domain.Interfaces.Repositories;
using EventosAPI.Infrastructure.Data;

namespace EventosAPI.Infrastructure.Repositories
{
    public class TicketRepository : BaseRepository<Ticket>, ITicketRepository
    {
        public TicketRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<Ticket?> GetByIdAsync(Guid id)
        {
            return await _dbSet
                .Include(t => t.Batch)
                    .ThenInclude(b => b.Event)
                .Include(t => t.Order)
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<IEnumerable<Ticket>> GetByUserIdAsync(Guid userId)
        {
            return await _dbSet
                .Include(t => t.Batch)
                    .ThenInclude(b => b.Event)
                .Include(t => t.Order)
                .Where(t => t.UserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Ticket>> GetByEventIdAsync(Guid eventId)
        {
            return await _dbSet
                .Include(t => t.Batch)
                    .ThenInclude(b => b.Event)
                .Include(t => t.Order)
                .Include(t => t.User)
                .Where(t => t.Batch.EventId == eventId)
                .ToListAsync();
        }

        public async Task<Ticket?> GetByQRCodeAsync(string qrCode)
        {
            return await _dbSet
                .Include(t => t.Batch)
                    .ThenInclude(b => b.Event)
                .Include(t => t.Order)
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.QRCode == qrCode);
        }

        public async Task<bool> QRCodeExistsAsync(string qrCode)
        {
            return await _dbSet.AnyAsync(t => t.QRCode == qrCode);
        }

        public override async Task<IEnumerable<Ticket>> GetByFilterAsync(System.Linq.Expressions.Expression<Func<Ticket, bool>> filter)
        {
            return await _dbSet
                .Include(t => t.Batch)
                    .ThenInclude(b => b.Event)
                .Include(t => t.Order)
                .Include(t => t.User)
                .Where(filter)
                .ToListAsync();
        }
    }
}
