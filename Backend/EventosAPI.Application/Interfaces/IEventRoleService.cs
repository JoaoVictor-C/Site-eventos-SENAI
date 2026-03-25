using EventosAPI.Application.DTOs;
using EventosAPI.Domain.Enums;

namespace EventosAPI.Application.Interfaces
{
    public interface IEventRoleService
    {
        Task<IEnumerable<EventRoleDto>> GetEventRolesAsync(Guid eventId);
        Task<IEnumerable<EventRoleDto>> GetUserEventRolesForEventAsync(Guid eventId, Guid userId);
        Task<IEnumerable<EventRoleDto>> GetMyEventRolesAsync(Guid eventId);
        Task AssignEventRoleAsync(Guid eventId, AssignEventRoleDto dto);
        Task RemoveEventRoleAsync(Guid eventId, Guid userId, EventRoleType roleType);
        Task<bool> HasEventPermissionAsync(Guid eventId, Guid userId, EventRoleType requiredRole);
        Task<IEnumerable<EventRoleDto>> GetUserEventRolesAsync(Guid userId);
    }
}
