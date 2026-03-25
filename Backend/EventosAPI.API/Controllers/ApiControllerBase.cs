using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using EventosAPI.Application.Interfaces;
using EventosAPI.Domain.Enums;
using AppUnauthorizedAccessException = EventosAPI.Application.Exceptions.UnauthorizedAccessException;
using EventosAPI.API.Models;

namespace EventosAPI.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public abstract class ApiControllerBase : ControllerBase
    {
        protected IActionResult HandleSuccess<T>(T? data = default, string? message = null, int statusCode = 200)
        {
            var response = new ApiResponse<T>
            {
                Success = true,
                Message = message,
                Data = data
            };

            return StatusCode(statusCode, response);
        }

        protected IActionResult HandleCreated<T>(T data, string? message = null, string? routeName = null, object? routeValues = null)
        {
            var response = new ApiResponse<T>
            {
                Success = true,
                Message = message,
                Data = data
            };

            if (routeName != null)
                return CreatedAtRoute(routeName, routeValues, response);

            return StatusCode(201, response);
        }

        protected IActionResult HandleError(string message, int statusCode = 400)
        {
            var response = new ApiResponse<object>
            {
                Success = false,
                Message = message,
                Data = null,
                Errors = null
            };

            return StatusCode(statusCode, response);
        }

        protected IActionResult HandleValidationError(IDictionary<string, string[]> errors)
        {
            var response = new ApiResponse<object>
            {
                Success = false,
                Message = "One or more validation errors occurred.",
                Data = null,
                Errors = errors
            };

            return StatusCode(400, response);
        }

        protected Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                throw new UnauthorizedAccessException("User is not authenticated");
            return userId;
        }

        protected bool IsCurrentUserAdmin()
        {
            return User.IsInRole("Admin");
        }

        protected async Task ValidateEventAccess(Guid eventId, IEventService eventService, IEventRoleService eventRoleService, EventRoleType requiredRole)
        {
            // Allow global admins to bypass event role checks
            if (IsCurrentUserAdmin())
                return;
            // Allow the owner of the event to bypass role checks
            if (await eventService.IsEventOrganizerAsync(eventId, GetCurrentUserId()))
                return;
            var userId = GetCurrentUserId();
            if (!await eventRoleService.HasEventPermissionAsync(eventId, userId, requiredRole))
                throw new AppUnauthorizedAccessException($"Forbidden: missing required role {requiredRole} for this event");
        }
    }
}
