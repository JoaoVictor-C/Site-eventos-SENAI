using EventosAPI.Domain.Enums;

namespace EventosAPI.Application.DTOs
{
    public class EventRoleDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = null!;
        public Guid EventId { get; set; }
        public string EventName { get; set; } = null!;
        public EventRoleType RoleType { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateEventRoleDto
    {
        public Guid UserId { get; set; }
        public EventRoleType RoleType { get; set; }
    }

    public class AssignEventRoleDto
    {
        public Guid EventId { get; set; }
        public Guid UserId { get; set; }
        public EventRoleType RoleType { get; set; }
    }
}