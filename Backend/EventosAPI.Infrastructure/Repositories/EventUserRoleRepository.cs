using Microsoft.EntityFrameworkCore;
using EventosAPI.Domain.Entities;
using EventosAPI.Domain.Enums;
using EventosAPI.Domain.Interfaces.Repositories;
using EventosAPI.Infrastructure.Data;

namespace EventosAPI.Infrastructure.Repositories
{
    public class EventUserRoleRepository : BaseRepository<EventRole>, IEventRoleRepository
    {
        public EventUserRoleRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<EventRole?> GetEventRoleAsync(Guid eventId, Guid userId, EventRoleType roleType)
        {
            return await _context.EventRoles
                .Include(r => r.User)
                .Include(r => r.Event)
                .FirstOrDefaultAsync(r => r.EventId == eventId && r.UserId == userId && r.RoleType == roleType);
        }

        public async Task<IEnumerable<EventRole>> GetEventRolesAsync(Guid eventId)
        {
            return await _context.EventRoles
                .Include(r => r.User)
                .Include(r => r.Event)
                .Where(r => r.EventId == eventId)
                .ToListAsync();
        }

        public async Task<IEnumerable<EventRole>> GetUserEventRolesAsync(Guid userId)
        {
            return await _context.EventRoles
                .Include(r => r.User)
                .Include(r => r.Event)
                .Where(r => r.UserId == userId)
                .ToListAsync();
        }
    }
}
