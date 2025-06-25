using Microsoft.EntityFrameworkCore;
using EventosAPI.Domain.Entities;
using EventosAPI.Domain.Interfaces.Repositories;
using EventosAPI.Infrastructure.Data;
using EventosAPI.Domain.Enums;

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

        // Event Role Management
        public async Task<EventRole?> GetEventRoleAsync(Guid eventId, Guid userId, EventRoleType roleType)
        {
            return await _context.Set<EventRole>()
                .Include(er => er.User)
                .Include(er => er.Event)
                .FirstOrDefaultAsync(er => er.EventId == eventId &&
                                        er.UserId == userId &&
                                        er.RoleType == roleType);
        }

        public async Task<IEnumerable<EventRole>> GetEventRolesAsync(Guid eventId)
        {
            return await _context.Set<EventRole>()
                .Include(er => er.User)
                .Include(er => er.Event)
                .Where(er => er.EventId == eventId)
                .ToListAsync();
        }

        public async Task<IEnumerable<EventRole>> GetUserEventRolesAsync(Guid userId)
        {
            return await _context.Set<EventRole>()
                .Include(er => er.User)
                .Include(er => er.Event)
                .Where(er => er.UserId == userId)
                .ToListAsync();
        }

        public async Task AddEventRoleAsync(EventRole eventRole)
        {
            await _context.Set<EventRole>().AddAsync(eventRole);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveEventRoleAsync(EventRole eventRole)
        {
            _context.Set<EventRole>().Remove(eventRole);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> HasEventRoleAsync(Guid eventId, Guid userId, EventRoleType roleType)
        {
            return await _context.Set<EventRole>()
                .AnyAsync(er => er.EventId == eventId && er.UserId == userId && er.RoleType == roleType);
        }

        public async Task AddRoleAsync(EventRole eventRole)
        {
            await _context.Set<EventRole>().AddAsync(eventRole);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveRoleAsync(Guid eventId, Guid userId, EventRoleType roleType)
        {
            var eventRole = await _context.Set<EventRole>()
                .FirstOrDefaultAsync(er => er.EventId == eventId && er.UserId == userId && er.RoleType == roleType);

            if (eventRole != null)
            {
                _context.Set<EventRole>().Remove(eventRole);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Event>> GetEventsByUserRolesAsync(Guid userId)
        {
            return await _context.Set<Event>()
                .Where(e => e.EventRoles.Any(er => er.UserId == userId))
                .ToListAsync();
        }

        public async Task<EventRole?> GetUserEventRoleAsync(Guid eventId, Guid userId)
        {
            return await _context.Set<EventRole>()
                .FirstOrDefaultAsync(er => er.EventId == eventId && er.UserId == userId);
        }
    }
}
