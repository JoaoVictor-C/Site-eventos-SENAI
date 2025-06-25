using EventosAPI.Domain.Entities;
using EventosAPI.Domain.Enums;

namespace EventosAPI.Domain.Interfaces.Repositories
{
    public interface IEventRepository : IBaseRepository<Event>
    {
        Task<IEnumerable<Event>> GetActiveEventsAsync();
        Task<IEnumerable<Event>> GetEventsByOrganizerAsync(Guid organizerId);
        Task<bool> HasAvailableTicketsAsync(Guid eventId);
        Task<int> GetAvailableTicketsCountAsync(Guid eventId);

        // Event Role Management
        Task<EventRole?> GetEventRoleAsync(Guid eventId, Guid userId, EventRoleType roleType);
        Task<IEnumerable<EventRole>> GetEventRolesAsync(Guid eventId);
        Task<IEnumerable<EventRole>> GetUserEventRolesAsync(Guid userId);
        Task<bool> HasEventRoleAsync(Guid eventId, Guid userId, EventRoleType roleType);
        Task AddRoleAsync(EventRole eventRole);
        Task RemoveRoleAsync(Guid eventId, Guid userId, EventRoleType roleType);
        Task AddEventRoleAsync(EventRole eventRole);
        Task RemoveEventRoleAsync(EventRole eventRole);
        Task<IEnumerable<Event>> GetEventsByUserRolesAsync(Guid userId);
        Task<EventRole?> GetUserEventRoleAsync(Guid eventId, Guid userId);
    }
}
