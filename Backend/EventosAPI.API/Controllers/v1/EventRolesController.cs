using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EventosAPI.Application.DTOs;
using EventosAPI.Application.Interfaces;
using EventosAPI.Domain.Enums;

namespace EventosAPI.API.Controllers.v1
{
    [ApiController]
    [Route("api/v1/events/{eventId}/roles")]
    [Authorize]
    public class EventRolesController : ApiControllerBase
    {
        private readonly IEventService _eventService;
        private readonly IEventRoleService _eventRoleService;

        public EventRolesController(
            IEventService eventService,
            IEventRoleService eventRoleService)
        {
            _eventService = eventService;
            _eventRoleService = eventRoleService;
        }

        [HttpGet("/api/v1/events/{eventId}/roles")]
        public async Task<IActionResult> GetEventRoles(Guid eventId)
        {
            var currentUserId = GetCurrentUserId();

            var roles = await _eventService.GetEventRolesAsync(eventId, currentUserId);
            return HandleSuccess(roles);
        }

        [HttpPost]
        public async Task<IActionResult> AssignRole(Guid eventId, [FromBody] CreateEventRoleDto dto)
        {
            var currentUserId = GetCurrentUserId();
            if (!await _eventRoleService.HasEventPermissionAsync(eventId, currentUserId, EventRoleType.ManageRoles))
                return HandleError("Forbidden", 403);

            await _eventRoleService.AssignEventRoleAsync(eventId, new AssignEventRoleDto
            {
                UserId = dto.UserId,
                RoleType = dto.RoleType
            });

            var result = await _eventRoleService.GetUserEventRoleAsync(eventId);
            return HandleSuccess(result, "Role assigned successfully", 201);
        }

        [HttpDelete("{userId}/{roleType}")]
        public async Task<IActionResult> RemoveRole(Guid eventId, Guid userId, EventRoleType roleType)
        {
            var currentUserId = GetCurrentUserId();
            if (!await _eventRoleService.HasEventPermissionAsync(eventId, currentUserId, EventRoleType.ManageRoles))
                return HandleError("Forbidden", 403);

            await _eventRoleService.RemoveEventRoleAsync(eventId, userId);
            return HandleSuccess<object>(null, "Role removed successfully");
        }

        [HttpGet("mine")]
        public async Task<IActionResult> GetMyEventRoles(Guid eventId)
        {
            var currentUserId = GetCurrentUserId();
            var role = await _eventRoleService.GetUserEventRoleAsync(eventId);
            return HandleSuccess(role);
        }

        [HttpGet("check/{roleType}")]
        public async Task<IActionResult> CheckRole(Guid eventId, EventRoleType roleType)
        {
            var currentUserId = GetCurrentUserId();
            var hasPermission = await _eventRoleService.HasEventPermissionAsync(eventId, currentUserId, roleType);
            return HandleSuccess(hasPermission);
        }

        [HttpGet("{userId}/event-roles")]
        [Authorize]
        public async Task<IActionResult> GetUserEventRoles(Guid userId)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId != userId && !IsCurrentUserAdmin())
                return HandleError("Forbidden", 403);
            var roles = await _eventRoleService.GetUserEventRolesAsync(userId);
            return HandleSuccess(roles);
        }


        [HttpGet("/api/v1/users/{userId}/manageable-events")]
        [Authorize]
        public async Task<IActionResult> GetManageableEvents(Guid userId)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId != userId && !IsCurrentUserAdmin())
                return HandleError("Forbidden", 403);
            var events = await _eventService.GetEventsByUserRolesAsync(userId);
            return HandleSuccess(events);
        }
    }
}
