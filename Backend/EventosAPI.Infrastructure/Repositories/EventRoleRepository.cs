using Microsoft.EntityFrameworkCore;
using EventosAPI.Domain.Entities;
using EventosAPI.Domain.Interfaces.Repositories;
using EventosAPI.Domain.Enums;
using EventosAPI.Infrastructure.Data;

namespace EventosAPI.Infrastructure.Repositories
{
    public class EventRoleRepository : BaseRepository<EventRole>, IEventRoleRepository
    {
        public EventRoleRepository(ApplicationDbContext context) : base(context)
        {
        }

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

        public async Task<IEnumerable<EventRole>> GetUserEventRolesForEventAsync(Guid eventId, Guid userId)
        {
            return await _context.Set<EventRole>()
                .Include(er => er.User)
                .Include(er => er.Event)
                .Where(er => er.EventId == eventId && er.UserId == userId)
                .ToListAsync();
        }
    }
}
