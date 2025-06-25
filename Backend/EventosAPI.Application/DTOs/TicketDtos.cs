using EventosAPI.Domain.Enums;

namespace EventosAPI.Application.DTOs
{
    public class TicketDto
    {
        public Guid Id { get; set; }
        public Guid BatchId { get; set; }
        public BatchDto Batch { get; set; } = null!;
        public Guid OrderId { get; set; }
        public OrderDto Order { get; set; } = null!;
        public Guid UserId { get; set; }
        public UserDto User { get; set; } = null!;
        public decimal Price { get; set; }
        public string QRCode { get; set; } = null!;
        public TicketStatus Status { get; set; }
        public TicketType Type { get; set; }
        public string? DocumentNumber { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? UsedAt { get; set; }
    }

    public class CreateTicketDto
    {
        public Guid BatchId { get; set; }
        public Guid OrderId { get; set; }
        public Guid UserId { get; set; }
        public TicketType Type { get; set; }
        public string? DocumentNumber { get; set; }
    }

    public class UpdateTicketDto
    {
        public TicketStatus? Status { get; set; }
        public DateTime? UsedAt { get; set; }
        public bool? IsActive { get; set; }
    }

    public class ValidateTicketDto
    {
        public string QRCode { get; set; } = null!;
        public Guid ValidatedByUserId { get; set; }
    }

    public class TicketPurchaseRequestDto
    {
        public Guid BatchId { get; set; }
        public int Quantity { get; set; }
        public TicketType Type { get; set; }
        public string? DocumentNumber { get; set; }
    }
}
