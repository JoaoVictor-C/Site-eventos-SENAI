using Microsoft.EntityFrameworkCore;
using EventosAPI.Domain.Entities;
using EventosAPI.Domain.Interfaces.Repositories;
using EventosAPI.Infrastructure.Data;

namespace EventosAPI.Infrastructure.Repositories
{
    public class EventRepository : BaseRepository<Event>, IEventRepository
    {
        public EventRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<Event?> GetByIdAsync(Guid id)
        {
            return await _dbSet
                .Include(e => e.Organizer)
                .Include(e => e.Batches)
                    .ThenInclude(b => b.Tickets)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public override async Task<IEnumerable<Event>> GetAllAsync()
        {
            return await _dbSet
                .Include(e => e.Organizer)
                .Include(e => e.Batches)
                    .ThenInclude(b => b.Tickets)
                .ToListAsync();
        }

        public async Task<IEnumerable<Event>> GetActiveEventsAsync()
        {
            return await _dbSet
                .Where(e => e.IsActive && e.EndDate >= DateTime.UtcNow)
                .Include(e => e.Batches)
                    .ThenInclude(b => b.Tickets)
                .ToListAsync();
        }

        public async Task<IEnumerable<Event>> GetEventsByOrganizerAsync(Guid organizerId)
        {
            return await _dbSet
                .Where(e => e.OrganizerId == organizerId)
                .Include(e => e.Batches)
                    .ThenInclude(b => b.Tickets)
                .ToListAsync();
        }

        public async Task<bool> HasAvailableTicketsAsync(Guid eventId)
        {
            var @event = await _dbSet
                .Include(e => e.Batches)
                    .ThenInclude(b => b.Tickets)
                .FirstOrDefaultAsync(e => e.Id == eventId);

            if (@event == null)
                return false;

            var totalSold = @event.Batches.Sum(b => b.Tickets.Count);
            return totalSold < @event.MaxParticipants;
        }

        public async Task<int> GetAvailableTicketsCountAsync(Guid eventId)
        {
            var @event = await _dbSet
                .Include(e => e.Batches)
                    .ThenInclude(b => b.Tickets)
                .FirstOrDefaultAsync(e => e.Id == eventId);

            if (@event == null)
                return 0;

            var totalSold = @event.Batches.Sum(b => b.Tickets.Count);
            return @event.MaxParticipants - totalSold;
        }

        public async Task<bool> IsOrganizerAsync(Guid eventId, Guid userId)
        {
            return await _dbSet.AnyAsync(e => e.Id == eventId && e.OrganizerId == userId);
        }

        public async Task<IEnumerable<Event>> GetEventsByUserRolesAsync(Guid userId)
        {
            return await _context.Set<Event>()
                .Where(e => e.EventRoles.Any(er => er.UserId == userId))
                .ToListAsync();
        }
    }
}
