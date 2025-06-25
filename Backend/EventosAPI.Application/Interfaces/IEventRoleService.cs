using EventosAPI.Application.DTOs;
using EventosAPI.Domain.Enums;

namespace EventosAPI.Application.Interfaces
{
    public interface IEventRoleService
    {
        Task<IEnumerable<EventRoleDto>> GetEventRolesAsync(Guid eventId);
        Task<EventRoleDto?> GetUserEventRoleAsync(Guid eventId);
        Task AssignEventRoleAsync(Guid eventId, AssignEventRoleDto dto);
        Task RemoveEventRoleAsync(Guid eventId, Guid userId);
        Task<bool> HasEventPermissionAsync(Guid eventId, Guid userId, EventRoleType minimumRole);
        Task<IEnumerable<EventRoleDto>> GetUserEventRolesAsync(Guid userId);
    }
}
