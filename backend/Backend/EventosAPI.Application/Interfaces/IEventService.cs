using EventosAPI.Application.DTOs;
using EventosAPI.Domain.Enums;

namespace EventosAPI.Application.Interfaces
{
    public interface IEventService
    {
        Task<EventDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<EventDto>> GetAllAsync();
        Task<IEnumerable<EventDto>> GetActiveEventsAsync();
        Task<IEnumerable<EventDto>> GetEventsByOrganizerAsync(Guid organizerId);
        Task<EventDto> CreateAsync(CreateEventDto createEventDto, Guid organizerId);
        Task UpdateAsync(Guid id, UpdateEventDto updateEventDto);
        Task DeleteAsync(Guid id);
        Task<bool> HasAvailableTicketsAsync(Guid eventId);
        Task<int> GetAvailableTicketsCountAsync(Guid eventId);

        // Event Role Management
        Task<EventRoleDto> AssignRoleAsync(AssignEventRoleDto roleDto);
        Task RemoveRoleAsync(Guid eventId, Guid userId, EventRoleType roleType);
        Task<IEnumerable<EventRoleDto>> GetEventRolesAsync(Guid eventId, Guid userId);
        Task<IEnumerable<EventRoleDto>> GetUserEventRolesAsync(Guid userId);
        Task<bool> HasEventRoleAsync(Guid eventId, Guid userId, EventRoleType roleType);

        // Batch Management
        Task<BatchDto> CreateBatchAsync(Guid eventId, CreateBatchDto createBatchDto);
        Task<BatchDto> UpdateBatchAsync(Guid eventId, Guid batchId, UpdateBatchDto updateBatchDto);
        Task DeleteBatchAsync(Guid eventId, Guid batchId);
        Task<IEnumerable<EventDto>> GetEventsByUserRolesAsync(Guid userId);
        Task<Guid> GetEventOwnerIdAsync(Guid eventId);
        Task<bool> IsEventOrganizerAsync(Guid eventId, Guid userId);
    }
}
