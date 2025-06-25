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
            Type = TicketType.Other;
            IsActive = true;
        }

        // Business logic properties
        public bool IsUsed => Status == TicketStatus.Used && UsedAt.HasValue;
        public bool IsCanceled => Status == TicketStatus.Canceled;
        public bool IsExpired => Status == TicketStatus.Expired || 
            (Batch.Event.EndDate < DateTime.UtcNow && Status != TicketStatus.Used);
        public bool IsValid => IsActive && !IsUsed && !IsCanceled && !IsExpired;

        public override bool Validate(out List<string> errors)
        {
            errors = new List<string>();

            if (OrderId == Guid.Empty)
                errors.Add("OrderId is required");

            if (BatchId == Guid.Empty)
                errors.Add("BatchId is required");

            if (UserId == Guid.Empty)
                errors.Add("UserId is required");

            if (string.IsNullOrEmpty(QRCode))
                errors.Add("QRCode is required");

            if (Price < 0)
                errors.Add("Price cannot be negative");

            if (Status == TicketStatus.Used && !UsedAt.HasValue)
                errors.Add("UsedAt must be set when ticket is used");

            if (UsedAt.HasValue && UsedAt > DateTime.UtcNow)
                errors.Add("UsedAt cannot be in the future");

            return base.Validate(out var baseErrors) && errors.Count == 0;
        }

        // Status management methods
        public void MarkAsUsed()
        {
            if (!IsValid)
                throw new InvalidOperationException("Cannot use an invalid ticket");

            Status = TicketStatus.Used;
            UsedAt = DateTime.UtcNow;
        }

        public void Cancel()
        {
            if (IsUsed)
                throw new InvalidOperationException("Cannot cancel a used ticket");

            Status = TicketStatus.Canceled;
            IsActive = false;

            // Return the ticket to batch stock if applicable
            Batch.ReturnTicketsToStock(1);
        }

        public void MarkAsPaid()
        {
            if (Status != TicketStatus.Pending)
                throw new InvalidOperationException("Can only mark pending tickets as paid");

            Status = TicketStatus.Paid;
        }

        public void CheckExpiry()
        {
            if (!IsExpired && Batch.Event.EndDate < DateTime.UtcNow && Status != TicketStatus.Used)
            {
                Status = TicketStatus.Expired;
                IsActive = false;
            }
        }

        // Validation methods
        public bool CanBeUsedByUser(Guid userId)
        {
            return IsValid && UserId == userId;
        }

        public bool CanBeValidatedByUser(User validator)
        {
            return IsValid && validator.CanValidateTickets(Batch.Event.Id);
        }
    }
}
