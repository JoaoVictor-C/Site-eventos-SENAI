using EventosAPI.Domain.Entities;
using EventosAPI.Domain.Enums;

namespace EventosAPI.Domain.Interfaces.Repositories
{
    public interface IEventRoleRepository : IBaseRepository<EventRole>
    {
        Task<EventRole?> GetEventRoleAsync(Guid eventId, Guid userId, EventRoleType roleType);
        Task<IEnumerable<EventRole>> GetEventRolesAsync(Guid eventId);
        Task<IEnumerable<EventRole>> GetUserEventRolesAsync(Guid userId);
        Task<IEnumerable<EventRole>> GetUserEventRolesForEventAsync(Guid eventId, Guid userId);
    }
}
