using EventosAPI.Domain.Enums;

namespace EventosAPI.Application.DTOs
{
    public class TicketReservationDto
    {
        public Guid BatchId { get; set; }
        public int Quantity { get; set; }
        public TicketType Type { get; set; }
        public bool AcceptTerms { get; set; }
    }

    public class TicketReservationResponseDto
    {
        public Guid OrderId { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime ReservationExpiration { get; set; }
        public string PaymentInstructions { get; set; } = null!;
        public IEnumerable<TicketDto> Tickets { get; set; } = null!;
    }

    public class TicketValidationDto
    {
        public Guid OrderId { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public string? PaymentReceipt { get; set; }
        public string? ValidationNotes { get; set; }
    }

    public class TicketPurchaseDto
    {
        public Guid BatchId { get; set; }
        public int Quantity { get; set; }
        public TicketType Type { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public string? PromoCode { get; set; }
        public bool AcceptTerms { get; set; }
    }

    public class TicketPurchaseResponseDto
    {
        public Guid OrderId { get; set; }
        public decimal TotalAmount { get; set; }
        public IEnumerable<TicketDto> Tickets { get; set; } = null!;
        public string PaymentInstructions { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
    }
}
