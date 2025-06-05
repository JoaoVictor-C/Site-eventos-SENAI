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
        
        public virtual ICollection<Event> OrganizedEvents { get; set; }
        public virtual ICollection<Order> Orders { get; set; }
        public virtual ICollection<Order> ValidatedOrders { get; set; }
        public virtual ICollection<Ticket> Tickets { get; set; }
        public virtual ICollection<RefreshToken> RefreshTokens { get; set; }
        
        public User()
        {
            IsActive = true;
            Role = UserRole.User;
            OrganizedEvents = new List<Event>();
            Orders = new List<Order>();
            ValidatedOrders = new List<Order>();
            Tickets = new List<Ticket>();
            RefreshTokens = new List<RefreshToken>();
        }

        public User(string name, string email) : this()
        {
            Name = name;
            Email = email;
        }
    }
}
