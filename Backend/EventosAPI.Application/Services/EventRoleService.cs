using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using AutoMapper;
using EventosAPI.Application.DTOs;
using EventosAPI.Application.Interfaces;
using EventosAPI.Domain.Entities;
using EventosAPI.Domain.Enums;
using EventosAPI.Domain.Interfaces.Repositories;

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

        public async Task<EventRoleDto?> GetUserEventRoleAsync(Guid eventId)
        {
            var userId = Guid.Parse(_httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
            var role = await _eventRoleRepository.GetEventRoleAsync(eventId, userId, EventRoleType.Moderator);
            return _mapper.Map<EventRoleDto>(role);
        }

        public async Task AssignEventRoleAsync(Guid eventId, AssignEventRoleDto dto)
        {
            var currentUserId = Guid.Parse(_httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
            var currentUser = await _userRepository.GetByIdAsync(currentUserId);

            if (currentUser == null || (!currentUser.IsAdminMaster(AdminMasterEmail) && !await IsEventOrganizerAsync(eventId, currentUserId)))
                throw new UnauthorizedAccessException("Você não tem permissão para gerenciar papéis neste evento");

            var existingRole = await _eventRoleRepository.GetEventRoleAsync(eventId, dto.UserId, dto.RoleType);
            if (existingRole != null)
            {
                existingRole.RoleType = dto.RoleType;
                await _eventRoleRepository.UpdateAsync(existingRole);
            }
            else
            {
                var newRole = new EventRole
                {
                    EventId = eventId,
                    UserId = dto.UserId,
                    RoleType = dto.RoleType
                };
                await _eventRoleRepository.CreateAsync(newRole);
            }
        }

        public async Task RemoveEventRoleAsync(Guid eventId, Guid userId)
        {
            var currentUserId = Guid.Parse(_httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());
            var currentUser = await _userRepository.GetByIdAsync(currentUserId);

            if (currentUser == null || (!currentUser.IsAdminMaster(AdminMasterEmail) && !await IsEventOrganizerAsync(eventId, currentUserId)))
                throw new UnauthorizedAccessException("Você não tem permissão para gerenciar papéis neste evento");

            var role = await _eventRoleRepository.GetEventRoleAsync(eventId, userId, EventRoleType.Moderator);
            if (role != null)
            {
                await _eventRoleRepository.DeleteAsync(role.Id);
            }
        }

        public async Task<bool> HasEventPermissionAsync(Guid eventId, Guid userId, EventRoleType minimumRole)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;
            return user.HasEventPermission(eventId, minimumRole, AdminMasterEmail);
        }

        private async Task<bool> IsEventOrganizerAsync(Guid eventId, Guid userId)
        {
            var @event = await _eventRepository.GetByIdAsync(eventId);
            return @event?.OrganizerId == userId;
        }

        public async Task<IEnumerable<EventRoleDto>> GetUserEventRolesAsync(Guid userId)
        {
            var roles = await _eventRoleRepository.GetUserEventRolesAsync(userId);
            return _mapper.Map<IEnumerable<EventRoleDto>>(roles);
        }
    }
}
