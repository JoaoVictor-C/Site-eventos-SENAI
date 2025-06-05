using EventosAPI.Domain.Enums;

namespace EventosAPI.Domain.Entities
{
    public class Batch : BaseEntity
    {
        public Guid EventId { get; set; }
        public virtual Event Event { get; set; }
        
        public string Name { get; set; }
        public decimal UnitPrice { get; set; }
        public int TotalQuantity { get; set; }
        public int Stock { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public BatchType Type { get; set; }
        
        public virtual ICollection<Ticket> Tickets { get; set; }

        public Batch()
        {
            IsActive = true;
            Type = BatchType.Quantity;
            Tickets = new List<Ticket>();
        }
    }
}
