using EventosAPI.Application.DTOs;

namespace EventosAPI.Application.Interfaces
{
    public interface IEventService
    {
        Task<EventDto> GetByIdAsync(Guid id);
        Task<IEnumerable<EventDto>> GetAllAsync();
        Task<IEnumerable<EventDto>> GetActiveEventsAsync();
        Task<IEnumerable<EventDto>> GetEventsByOrganizerAsync(Guid organizerId);
        Task<EventDto> CreateAsync(CreateEventDto createEventDto, Guid organizerId);
        Task UpdateAsync(Guid id, UpdateEventDto updateEventDto);
        Task DeleteAsync(Guid id);
        Task<bool> HasAvailableTicketsAsync(Guid eventId);
        Task<int> GetAvailableTicketsCountAsync(Guid eventId);
    }
}
