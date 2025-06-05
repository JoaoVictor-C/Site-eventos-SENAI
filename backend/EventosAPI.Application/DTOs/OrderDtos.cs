using EventosAPI.Domain.Enums;

namespace EventosAPI.Application.DTOs
{
    public class OrderDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public UserDto? User { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal Total { get; set; }
        public int Quantity { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public OrderStatus Status { get; set; }
        public Guid? ValidatedByUserId { get; set; }
        public UserDto? ValidatedByUser { get; set; }
        public ICollection<TicketDto>? Tickets { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateOrderDto
    {
        public Guid UserId { get; set; }
        public int Quantity { get; set; }
        public Guid BatchId { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
    }

    public class UpdateOrderDto
    {
        public OrderStatus? Status { get; set; }
        public Guid? ValidatedByUserId { get; set; }
    }

    public class OrderSummaryDto
    {
        public Guid Id { get; set; }
        public string EventName { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public DateTime OrderDate { get; set; }
        public decimal Total { get; set; }
        public int Quantity { get; set; }
        public OrderStatus Status { get; set; }
    }
}
