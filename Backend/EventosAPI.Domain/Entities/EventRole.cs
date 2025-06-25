using EventosAPI.Domain.Enums;

namespace EventosAPI.Domain.Entities
{
    public class EventRole : BaseEntity
    {
        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;
        
        public Guid EventId { get; set; }
        public virtual Event Event { get; set; } = null!;
        
        public EventRoleType RoleType { get; set; }
    }
}
