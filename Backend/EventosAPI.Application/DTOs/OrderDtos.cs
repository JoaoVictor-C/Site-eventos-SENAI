using EventosAPI.Domain.Enums;

namespace EventosAPI.Application.DTOs
{
    public class OrderDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = null!;
        public Guid EventId { get; set; }
        public string EventName { get; set; } = null!;
        public DateTime OrderDate { get; set; }
        public decimal Total { get; set; }
        public int Quantity { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public OrderStatus Status { get; set; }
        public Guid? ValidatedByUserId { get; set; }
        public string? ValidatorName { get; set; }
        public IEnumerable<TicketDto> Tickets { get; set; } = null!;
    }
}
