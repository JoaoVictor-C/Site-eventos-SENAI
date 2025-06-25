using EventosAPI.Domain.Enums;

namespace EventosAPI.Domain.Entities
{
    public class Order : BaseEntity
    {
        public Guid UserId { get; set; }
        public virtual required User User { get; set; }
        
        public Guid EventId { get; set; }
        public virtual required Event Event { get; set; }
        
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

        // Business logic properties
        public bool IsReserved => Status == OrderStatus.Reserved;
        public bool IsPending => Status == OrderStatus.Pending;
        public bool IsPaid => Status == OrderStatus.Paid;
        public bool IsCanceled => Status == OrderStatus.Canceled;
        public bool IsExpired => Status == OrderStatus.Expired;
        public bool CanBePaid => (IsPending || IsReserved) && !IsExpired;
        public bool IsValidated => ValidatedByUserId.HasValue;

        public override bool Validate(out List<string> errors)
        {
            errors = new List<string>();

            if (UserId == Guid.Empty)
                errors.Add("UserId is required");

            if (Total < 0)
                errors.Add("Total cannot be negative");

            if (Quantity <= 0)
                errors.Add("Quantity must be greater than zero");

            if (Status == OrderStatus.Paid && Total == 0 && PaymentMethod != PaymentMethod.Free)
                errors.Add("Paid orders must have a total greater than zero unless they are free");

            if (ValidatedByUserId.HasValue && Status != OrderStatus.Paid)
                errors.Add("Only paid orders can be validated");

            if (OrderDate > DateTime.UtcNow)
                errors.Add("Order date cannot be in the future");

            // Check tickets consistency
            if (Tickets.Count != Quantity)
                errors.Add("Number of tickets must match the order quantity");

            // Check total consistency
            var ticketsTotal = Tickets.Sum(t => t.Price);
            if (Math.Abs(ticketsTotal - Total) > 0.01m) // Using small delta for decimal comparison
                errors.Add("Order total must match the sum of ticket prices");

            return base.Validate(out var baseErrors) && errors.Count == 0;
        }

        // Order management methods
        public void MarkAsPaid(PaymentMethod method)
        {
            if (!CanBePaid)
                throw new InvalidOperationException("Order cannot be paid");

            Status = OrderStatus.Paid;
            PaymentMethod = method;

            // Update tickets status
            foreach (var ticket in Tickets)
            {
                ticket.MarkAsPaid();
            }
        }

        public void Cancel(bool returnToStock = true)
        {
            if (Status == OrderStatus.Paid)
                throw new InvalidOperationException("Cannot cancel a paid order");

            Status = OrderStatus.Canceled;

            // Cancel all tickets and optionally return them to stock
            foreach (var ticket in Tickets)
            {
                if (returnToStock)
                    ticket.Cancel();
                else
                {
                    ticket.Status = TicketStatus.Canceled;
                    ticket.IsActive = false;
                }
            }
        }

        public void CheckExpiry()
        {
            if (IsPending && OrderDate.AddMinutes(15) < DateTime.UtcNow)
            {
                Status = OrderStatus.Expired;
                Cancel(true); // Return tickets to stock
            }
        }

        public void ValidateOrder(User validator)
        {
            if (!IsPaid)
                throw new InvalidOperationException("Cannot validate an unpaid order");

            var firstTicket = Tickets.FirstOrDefault() ?? 
                throw new InvalidOperationException("Order has no tickets");

            if (!validator.CanValidateTickets(firstTicket.Batch.Event.Id))
                throw new InvalidOperationException("User cannot validate tickets for this event");

            ValidatedByUserId = validator.Id;
            ValidatedByUser = validator;
        }
    }
}
