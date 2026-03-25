using System.Security.Claims;
using AutoMapper;
using EventosAPI.Application.DTOs;
using AppUnauthorizedAccessException = EventosAPI.Application.Exceptions.UnauthorizedAccessException;
using EventosAPI.Application.Interfaces;
using EventosAPI.Domain.Entities;
using EventosAPI.Domain.Enums;
using EventosAPI.Domain.Interfaces.Repositories;
using Microsoft.AspNetCore.Http;

namespace EventosAPI.Application.Services
{
    public class EventRoleService : IEventRoleService
    {
        private readonly IEventRoleRepository _eventRoleRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IUserRepository _userRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMapper _mapper;

        private const string AdminMasterEmail = "admin@eventos.com"; // Change to your email

        public EventRoleService(
            IEventRoleRepository eventRoleRepository,
            IEventRepository eventRepository,
            IUserRepository userRepository,
            IHttpContextAccessor httpContextAccessor,
            IMapper mapper)
        {
            _eventRoleRepository = eventRoleRepository;
            _eventRepository = eventRepository;
            _userRepository = userRepository;
            _httpContextAccessor = httpContextAccessor;
            _mapper = mapper;
        }

        public async Task<IEnumerable<EventRoleDto>> GetEventRolesAsync(Guid eventId)
        {
            var roles = await _eventRoleRepository.GetEventRolesAsync(eventId);
            return _mapper.Map<IEnumerable<EventRoleDto>>(roles);
        }

        public async Task<IEnumerable<EventRoleDto>> GetUserEventRolesForEventAsync(Guid eventId, Guid userId)
        {
            var roles = await _eventRoleRepository.GetUserEventRolesForEventAsync(eventId, userId);
            return _mapper.Map<IEnumerable<EventRoleDto>>(roles);
        }

        public async Task<IEnumerable<EventRoleDto>> GetMyEventRolesAsync(Guid eventId)
        {
            var userId = GetCurrentUserId();
            return await GetUserEventRolesForEventAsync(eventId, userId);
        }

        public async Task AssignEventRoleAsync(Guid eventId, AssignEventRoleDto dto)
        {
            await EnsureCanManageRolesAsync(eventId);

            foreach (var role in ExpandToAtomicRoles(dto.RoleType))
            {
                var existing = await _eventRoleRepository.GetEventRoleAsync(eventId, dto.UserId, role);
                if (existing != null) continue;

                await _eventRoleRepository.CreateAsync(new EventRole
                {
                    EventId = eventId,
                    UserId = dto.UserId,
                    RoleType = role
                });
            }
        }

        public async Task RemoveEventRoleAsync(Guid eventId, Guid userId, EventRoleType roleType)
        {
            await EnsureCanManageRolesAsync(eventId);

            foreach (var role in ExpandToAtomicRoles(roleType))
            {
                var existing = await _eventRoleRepository.GetEventRoleAsync(eventId, userId, role);
                if (existing != null)
                    await _eventRoleRepository.DeleteAsync(existing.Id);
            }
        }

        public async Task<bool> HasEventPermissionAsync(Guid eventId, Guid userId, EventRoleType requiredRole)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            if (user.IsAdminMaster(AdminMasterEmail)) return true;
            if (await _eventRepository.IsOrganizerAsync(eventId, userId)) return true;

            var roles = await _eventRoleRepository.GetUserEventRolesForEventAsync(eventId, userId);
            var mask = roles.Aggregate(EventRoleType.None, (current, next) => current | next.RoleType);

            return (mask & requiredRole) == requiredRole;
        }

        public async Task<IEnumerable<EventRoleDto>> GetUserEventRolesAsync(Guid userId)
        {
            var roles = await _eventRoleRepository.GetUserEventRolesAsync(userId);
            return _mapper.Map<IEnumerable<EventRoleDto>>(roles);
        }

        private Guid GetCurrentUserId()
        {
            var id = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(id) || !Guid.TryParse(id, out var userId))
                throw new System.UnauthorizedAccessException("User is not authenticated");

            return userId;
        }

        private async Task EnsureCanManageRolesAsync(Guid eventId)
        {
            var currentUserId = GetCurrentUserId();
            var currentUser = await _userRepository.GetByIdAsync(currentUserId);

            if (currentUser == null)
                throw new AppUnauthorizedAccessException("Forbidden");

            if (currentUser.IsAdminMaster(AdminMasterEmail)) return;
            if (await _eventRepository.IsOrganizerAsync(eventId, currentUserId)) return;
            if (await HasEventPermissionAsync(eventId, currentUserId, EventRoleType.ManageRoles)) return;

            throw new AppUnauthorizedAccessException("Forbidden");
        }

        private static IEnumerable<EventRoleType> ExpandToAtomicRoles(EventRoleType roleType)
        {
            if (roleType == EventRoleType.None)
                yield break;

            foreach (var value in Enum.GetValues<EventRoleType>())
            {
                var intValue = (int)value;
                if (intValue == 0) continue;
                if ((intValue & (intValue - 1)) != 0) continue; // not a power-of-two flag

                if ((roleType & value) == value)
                    yield return value;
            }
        }
    }
}
