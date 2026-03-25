using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EventosAPI.Application.DTOs;
using EventosAPI.Application.Interfaces;
using EventosAPI.Domain.Enums;
using AppUnauthorizedAccessException = EventosAPI.Application.Exceptions.UnauthorizedAccessException;

namespace EventosAPI.API.Controllers.v1
{
    [ApiController]
    [Route("api/v1/events/{eventId}/roles")]
    [Authorize]
    public class EventRolesController : ApiControllerBase
    {
        private readonly IEventService _eventService;
        private readonly IEventRoleService _eventRoleService;

        public EventRolesController(IEventService eventService, IEventRoleService eventRoleService)
        {
            _eventService = eventService;
            _eventRoleService = eventRoleService;
        }

        [HttpGet]
        public async Task<IActionResult> GetEventRoles(Guid eventId)
        {
            var currentUserId = GetCurrentUserId();
            if (!await _eventRoleService.HasEventPermissionAsync(eventId, currentUserId, EventRoleType.ManageRoles))
                throw new AppUnauthorizedAccessException("Forbidden");

            var roles = await _eventRoleService.GetEventRolesAsync(eventId);
            return HandleSuccess(roles);
        }

        [HttpPost]
        public async Task<IActionResult> AssignRole(Guid eventId, [FromBody] CreateEventRoleDto dto)
        {
            var currentUserId = GetCurrentUserId();
            if (!await _eventRoleService.HasEventPermissionAsync(eventId, currentUserId, EventRoleType.ManageRoles))
                throw new AppUnauthorizedAccessException("Forbidden");

            await _eventRoleService.AssignEventRoleAsync(eventId, new AssignEventRoleDto
            {
                EventId = eventId,
                UserId = dto.UserId,
                RoleType = dto.RoleType
            });

            var result = await _eventRoleService.GetUserEventRolesForEventAsync(eventId, dto.UserId);
            return HandleSuccess(result, "Role assigned successfully", 201);
        }

        [HttpDelete("{userId}/{roleType}")]
        public async Task<IActionResult> RemoveRole(Guid eventId, Guid userId, EventRoleType roleType)
        {
            var currentUserId = GetCurrentUserId();
            if (!await _eventRoleService.HasEventPermissionAsync(eventId, currentUserId, EventRoleType.ManageRoles))
                throw new AppUnauthorizedAccessException("Forbidden");

            await _eventRoleService.RemoveEventRoleAsync(eventId, userId, roleType);
            return HandleSuccess<object>(null, "Role removed successfully");
        }

        [HttpGet("mine")]
        public async Task<IActionResult> GetMyEventRoles(Guid eventId)
        {
            var roles = await _eventRoleService.GetMyEventRolesAsync(eventId);
            return HandleSuccess(roles);
        }

        [HttpGet("check/{roleType}")]
        public async Task<IActionResult> CheckRole(Guid eventId, EventRoleType roleType)
        {
            var currentUserId = GetCurrentUserId();
            var hasPermission = await _eventRoleService.HasEventPermissionAsync(eventId, currentUserId, roleType);
            return HandleSuccess(hasPermission);
        }

        [HttpGet("{userId}/event-roles")]
        public async Task<IActionResult> GetUserEventRoles(Guid eventId, Guid userId)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId != userId && !IsCurrentUserAdmin())
                throw new AppUnauthorizedAccessException("Forbidden");

            var roles = await _eventRoleService.GetUserEventRolesForEventAsync(eventId, userId);
            return HandleSuccess(roles);
        }

        [HttpGet("/api/v1/users/{userId}/manageable-events")]
        public async Task<IActionResult> GetManageableEvents(Guid userId)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId != userId && !IsCurrentUserAdmin())
                throw new AppUnauthorizedAccessException("Forbidden");

            var events = await _eventService.GetEventsByUserRolesAsync(userId);
            return HandleSuccess(events);
        }
    }
}