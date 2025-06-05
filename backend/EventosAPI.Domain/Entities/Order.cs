using EventosAPI.Domain.Enums;

namespace EventosAPI.Domain.Entities
{
    public class Order : BaseEntity
    {
        public Guid UserId { get; set; }
        public virtual required User User { get; set; }
        
        public DateTime OrderDate { get; set; }
        public decimal Total { get; set; }
        public int Quantity { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public OrderStatus Status { get; set; }
        
        public Guid? ValidatedByUserId { get; set; }
        public virtual User? ValidatedByUser { get; set; }
        
        public virtual ICollection<Ticket> Tickets { get; set; }

        public Order()
        {
            OrderDate = DateTime.UtcNow;
            Status = OrderStatus.Pending;
            Tickets = new List<Ticket>();
        }
    }
}
