using EventosAPI.Domain.Enums;

namespace EventosAPI.Domain.Entities
{
    public class User : BaseEntity
    {
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string? Phone { get; set; }
        public UserRole Role { get; set; }
        public bool IsActive { get; set; }
        public string? TwoFactorSecret { get; set; }
        
        public virtual ICollection<Event> OrganizedEvents { get; set; }
        public virtual ICollection<Order> Orders { get; set; }
        public virtual ICollection<Order> ValidatedOrders { get; set; }
        public virtual ICollection<Ticket> Tickets { get; set; }
        public virtual ICollection<RefreshToken> RefreshTokens { get; set; }
        public virtual ICollection<EventRole> EventRoles { get; set; }
        
        public User()
        {
            IsActive = true;
            Role = UserRole.User;
            OrganizedEvents = new List<Event>();
            Orders = new List<Order>();
            ValidatedOrders = new List<Order>();
            Tickets = new List<Ticket>();
            RefreshTokens = new List<RefreshToken>();
            EventRoles = new List<EventRole>();
        }

        public User(string name, string email) : this()
        {
            Name = name;
            Email = email;
        }

        public bool HasRole(UserRole role)
        {
            return (Role & role) == role;
        }

        public bool IsAdmin()
        {
            return HasRole(UserRole.Admin);
        }

        public bool IsAdminMaster(string? adminEmail = null)
        {
            // You can change this email to your own
            return string.Equals(Email, adminEmail ?? "admin@eventos.com", StringComparison.OrdinalIgnoreCase);
        }

        public EventRoleType GetEventRoles(Guid eventId)
        {
            // Admins have all permissions
            if (IsAdmin()) return EventRoleType.Moderator;
            
            // Event owners have all permissions
            if (OrganizedEvents.Any(e => e.Id == eventId))
                return EventRoleType.Moderator;
            
            // Combine all roles the user has for this event
            return EventRoles.Where(er => er.EventId == eventId)
                           .Select(er => er.RoleType)
                           .Aggregate(EventRoleType.None, (current, next) => current | next);
        }

        public bool HasEventRole(Guid eventId, EventRoleType roleType)
        {
            var roles = GetEventRoles(eventId);
            return (roles & roleType) == roleType;
        }

        public bool CanManageEvent(Guid eventId)
        {
            return HasEventRole(eventId, EventRoleType.ManageEvent);
        }

        public bool CanValidateTickets(Guid eventId)
        {
            return HasEventRole(eventId, EventRoleType.ManageTickets);
        }
        
        public bool CanManageRoles(Guid eventId)
        {
            return HasEventRole(eventId, EventRoleType.ManageRoles);
        }

        public bool CanManageBatches(Guid eventId)
        {
            return HasEventRole(eventId, EventRoleType.ManageBatches);
        }

        public bool CanViewReports(Guid eventId)
        {
            return HasEventRole(eventId, EventRoleType.ViewReports);
        }

        public bool IsEventOwner(Guid eventId)
        {
            return OrganizedEvents.Any(e => e.Id == eventId);
        }

        public bool HasEventPermission(Guid eventId, EventRoleType requiredRole, string? adminEmail = null)
        {
            if (IsAdminMaster(adminEmail)) return true;
            if (IsEventOwner(eventId)) return true;
            return HasEventRole(eventId, requiredRole);
        }
    }
}
