using EventosAPI.Domain.Enums;

namespace EventosAPI.Domain.Entities
{
    public class Ticket : BaseEntity
    {
        public Guid OrderId { get; set; }
        public virtual Order Order { get; set; } = null!;
        
        public Guid BatchId { get; set; }
        public virtual Batch Batch { get; set; } = null!;
        
        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;
        
        public TicketStatus Status { get; set; }
        public TicketType Type { get; set; }
        public DateTime? UsedAt { get; set; }
        public bool IsActive { get; set; }
        public decimal Price { get; set; }
        public string QRCode { get; set; } = null!;

        public Ticket()
        {
            Status = TicketStatus.Pending;
            Type = TicketType.Student;
            IsActive = true;
        }
    }
}
