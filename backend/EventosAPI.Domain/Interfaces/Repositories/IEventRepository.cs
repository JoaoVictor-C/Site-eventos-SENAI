using EventosAPI.Domain.Entities;

namespace EventosAPI.Domain.Interfaces.Repositories
{
    public interface IEventRepository : IBaseRepository<Event>
    {
        Task<IEnumerable<Event>> GetActiveEventsAsync();
        Task<IEnumerable<Event>> GetEventsByOrganizerAsync(Guid organizerId);
        Task<bool> HasAvailableTicketsAsync(Guid eventId);
        Task<int> GetAvailableTicketsCountAsync(Guid eventId);
    }
}
