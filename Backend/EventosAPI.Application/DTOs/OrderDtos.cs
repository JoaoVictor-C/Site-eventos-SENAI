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

    public class OrderSummaryDto
    {
        public Guid Id { get; set; }
        public string EventName { get; set; } = null!;
        public DateTime EventDate { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal Total { get; set; }
        public int Quantity { get; set; }
        public OrderStatus Status { get; set; }
        public string? PaymentStatus { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }

    public class CreateOrderDto
    {
        public Guid BatchId { get; set; }
        public Guid UserId { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public int Quantity { get; set; }
        public List<TicketRequestDto> TicketRequests { get; set; } = new();
    }

    public class UpdateOrderDto
    {
        public OrderStatus Status { get; set; }
        public PaymentMethod? PaymentMethod { get; set; }
        public string? ValidationNotes { get; set; }
    }

    public class TicketRequestDto
    {
        public TicketType Type { get; set; }
        public string? DocumentNumber { get; set; }
    }
}
