using System;
using System.Collections.Generic;
using System.Linq;
using EventosAPI.Domain.Enums;

namespace EventosAPI.Domain.Entities
{
    public class Batch : BaseEntity
    {
        // Required properties
        public required string Name { get; set; }
        public required BatchType Type { get; set; }
        public decimal UnitPrice { get; set; }
        public int TotalQuantity { get; set; }
        public int Stock { get; set; }

        // Optional properties based on type
        private DateTime? _startDate;
        private DateTime? _endDate;
        public DateTime? StartDate
        {
            get => _startDate;
            set => _startDate = Type == BatchType.Quantity ? null : value;
        }
        public DateTime? EndDate
        {
            get => _endDate;
            set => _endDate = Type == BatchType.Quantity ? null : value;
        }
        public bool IsActive { get; set; }

        // Navigation properties
        public Guid EventId { get; private set; }
        public virtual Event Event { get; private set; } = null!;
        public virtual ICollection<Ticket> Tickets { get; private set; }

        // Constructor for creating new batches (internal to allow Event to create batches)
        internal Batch()
        {
            Tickets = new List<Ticket>();
            IsActive = true;
        }

        // Domain constructor
        public Batch(Event @event, string name, BatchType type, decimal unitPrice, int totalQuantity)
            : this()
        {
            Event = @event ?? throw new ArgumentNullException(nameof(@event));
            EventId = @event.Id;
            Name = name;
            Type = type;
            UnitPrice = unitPrice;
            TotalQuantity = totalQuantity;
            Stock = totalQuantity;
            IsActive = true;
            if (type == BatchType.TimeWindow)
            {
                StartDate = DateTime.UtcNow; // Default to now for time window batches
                EndDate = StartDate.Value.AddHours(1); // Default to 1 hour duration
            }
            else if (type == BatchType.Free)
            {
                StartDate = null; // Free batches can have no dates
                EndDate = null;
                UnitPrice = 0; // Free batches must have zero price
            }
            else if (type == BatchType.Quantity)
            {
                StartDate = null; // Quantity batches should not have dates
                EndDate = null;
            }
        }
        // Business logic properties
        private bool IsInTimeWindow
        {
            get
            {
                if (Type == BatchType.Quantity) return true;
                if (StartDate == default || EndDate == default) return true;
                var now = DateTime.UtcNow;
                return now >= StartDate && now < EndDate;
            }
        }

        public bool HasStarted => Type switch
        {
            BatchType.Quantity => true,
            BatchType.TimeWindow => DateTime.UtcNow >= StartDate,
            BatchType.Free => StartDate == default || DateTime.UtcNow >= StartDate,
            _ => false
        };

        public bool HasEnded => Type switch
        {
            BatchType.Quantity => Stock <= 0,
            BatchType.TimeWindow => DateTime.UtcNow >= EndDate,
            BatchType.Free => (EndDate != default && DateTime.UtcNow >= EndDate) || Stock <= 0,
            _ => true
        };

        public bool IsAvailable => IsActive && !HasEnded && IsInTimeWindow && HasStock;

        public bool HasStock => Type switch
        {
            BatchType.Quantity => Stock > 0,
            BatchType.TimeWindow => true,
            BatchType.Free => Stock > 0,
            _ => false
        };

        // Domain validation
        private void ValidateBatchDates(List<string> errors)
        {
            // Current date validation
            if (StartDate < DateTime.UtcNow)
                errors.Add("A data de início deve ser no futuro");

            // Start/End date validation
            if (EndDate <= StartDate)
                errors.Add("A data de término deve ser posterior à data de início");

            // Duration validation
            if (EndDate != default && StartDate != default)
            {
                TimeSpan? duration = EndDate - StartDate;
                if (duration?.TotalHours < 1)
                    errors.Add("A duração mínima do lote é 1 hora");
                if (duration?.TotalDays > 90)
                    errors.Add("A duração máxima do lote é 90 dias");
            }

            // Event date validation
            if (Event != null)
            {
                if (StartDate < Event.EventDate)
                    errors.Add("A data de início do lote não pode ser anterior à data do evento");
                if (EndDate > Event.EndDate)
                    errors.Add("A data de término do lote não pode ser posterior à data de término do evento");
            }
        }

        public override bool Validate(out List<string> errors)
        {
            errors = new List<string>();

            // Common validations
            if (string.IsNullOrWhiteSpace(Name))
                errors.Add("O nome do lote é obrigatório");

            if (Name.Length > 45)
                errors.Add("O nome do lote deve ter no máximo 45 caracteres");

            if (!System.Text.RegularExpressions.Regex.IsMatch(Name, "^[a-zA-Z0-9 ]*$"))
                errors.Add("O nome do lote deve conter apenas letras, números e espaços");

            if (UnitPrice < 0)
                errors.Add("O preço unitário não pode ser negativo");

            if (TotalQuantity <= 0)
                errors.Add("A quantidade total deve ser maior que zero");

            if (Stock > TotalQuantity)
                errors.Add("O estoque não pode ser maior que a quantidade total");

            // Type-specific validations
            switch (Type)
            {
                case BatchType.Quantity:
                    if (TotalQuantity > 10000)
                        errors.Add("A quantidade total não pode exceder 10.000");

                    // Dates should be empty for Quantity type
                    // if ((StartDate != default && StartDate != null) || (EndDate != default && EndDate != null))
                    //     errors.Add("Lotes do tipo quantidade não devem ter datas definidas");
                    break;

                case BatchType.Free:
                    if (UnitPrice != 0)
                        errors.Add("Lotes gratuitos devem ter preço zero");

                    // Dates are optional for Free type
                    if ((StartDate != default && StartDate != DateTime.MinValue) || (EndDate != default && EndDate != DateTime.MinValue)) 
                    {
                        ValidateBatchDates(errors);
                    }
                    break;

                case BatchType.TimeWindow:
                    // Dates are required for TimeWindow type
                    if (StartDate == default || EndDate == default)
                        errors.Add("Datas são obrigatórias para lotes do tipo janela de tempo");
                    else
                        ValidateBatchDates(errors);
                    break;
            }

            // Event validation
            if (Event != null)
            {
                // Ensure total tickets across all batches doesn't exceed event capacity
                int totalBatchesQuantity = Event.Batches?.Where(b => b.Id != Id).Sum(b => b.TotalQuantity) ?? 0;
                totalBatchesQuantity += TotalQuantity;

                if (totalBatchesQuantity > Event.MaxParticipants)
                    errors.Add($"A quantidade total de ingressos ({totalBatchesQuantity}) excede a capacidade do evento ({Event.MaxParticipants})");
            }

            var isValid = base.Validate(out var baseErrors);
            errors.AddRange(baseErrors);
            return errors.Count == 0 && isValid;
        }

        // Stock management methods
        public bool ReserveTickets(int quantity)
        {
            if (Type == BatchType.Quantity)
            {
                if (Stock < quantity)
                    return false;

                Stock -= quantity;
            }
            return true;
        }

        public void ReturnTicketsToStock(int quantity)
        {
            if (Type == BatchType.Quantity)
            {
                Stock = Math.Min(Stock + quantity, TotalQuantity);
            }
        }

        // Batch management methods
        public void Activate()
        {
            if (!HasEnded)
                IsActive = true;
        }

        public void Deactivate()
        {
            IsActive = false;
        }

        public void ExtendEndDate(DateTime newEndDate)
        {
            if (newEndDate > DateTime.UtcNow && newEndDate <= Event.EndDate)
                EndDate = newEndDate;
        }

        public bool CanPurchaseTickets(int quantity)
        {
            if (!IsAvailable) return false;

            switch (Type)
            {
                case BatchType.Free:
                    return Stock >= quantity && quantity <= 2; // Free tickets limited to 2 per purchase
                case BatchType.TimeWindow:
                    return true;
                case BatchType.Quantity:
                    return Stock >= quantity;
                default:
                    return false;
            }
        }
    }
}
