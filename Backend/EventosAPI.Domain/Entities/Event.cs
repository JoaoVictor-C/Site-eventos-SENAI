using EventosAPI.Domain.Enums;

namespace EventosAPI.Domain.Entities
{
    public class Event : BaseEntity
    {
        // Required properties
        public required string Name { get; set; }
        public required string Description { get; set; }
        public required string Location { get; set; }
        public DateTime EventDate { get; set; }
        public DateTime EndDate { get; set; }
        
        // Optional properties
        public string? ImageUrl { get; set; }
        public bool IsActive { get; private set; }
        public int MaxParticipants { get; set; }
        public EventCategory Category { get; set; }
        
        // Navigation properties
        public Guid OrganizerId { get; private set; }
        public virtual User Organizer { get; private set; } = null!;
        public virtual ICollection<Batch> Batches { get; private set; }
        public virtual ICollection<EventRole> EventRoles { get; private set; }

        // Constructor for EF Core
        protected Event()
        {
            Batches = new List<Batch>();
            EventRoles = new List<EventRole>();
        }

        // Domain constructor
        public Event(string name, string description, string location, DateTime eventDate, DateTime endDate, 
                    User organizer, int maxParticipants = 0, EventCategory category = EventCategory.Other)
            : this()
        {
            Name = name;
            Description = description;
            Location = location;
            EventDate = eventDate.ToUniversalTime();
            EndDate = endDate.ToUniversalTime();
            Organizer = organizer ?? throw new ArgumentNullException(nameof(organizer));
            OrganizerId = organizer.Id;
            MaxParticipants = maxParticipants;
            Category = category;
            IsActive = true;
        }

        public bool HasAvailableTickets => Batches.Any(b => b.IsActive && b.Stock > 0);
        public bool IsOpen => IsActive && EventDate > DateTime.UtcNow;
        public bool HasStarted => EventDate <= DateTime.UtcNow;
        public bool HasEnded => EndDate <= DateTime.UtcNow;

        public override bool Validate(out List<string> errors)
        {
            bool isValid = base.Validate(out errors);

            // Required fields validation
            if (string.IsNullOrWhiteSpace(Name))
                errors.Add("Event name is required");
            else if (Name.Length > 100)
                errors.Add("Event name cannot exceed 100 characters");

            if (string.IsNullOrWhiteSpace(Description))
                errors.Add("Event description is required");
            else if (Description.Length > 2000)
                errors.Add("Event description cannot exceed 2000 characters");

            if (string.IsNullOrWhiteSpace(Location))
                errors.Add("Event location is required");
            else if (Location.Length > 200)
                errors.Add("Event location cannot exceed 200 characters");

            // Date validations
            if (EventDate == default)
                errors.Add("Event date is required");
            if (EndDate == default)
                errors.Add("End date is required");
            if (EventDate >= EndDate)
                errors.Add("Event end date must be after the event start date");
            
            // Capacity validation
            if (MaxParticipants < 0)
                errors.Add("Max participants cannot be negative");
            if (MaxParticipants > 0 && Batches.Any())
            {
                var totalBatchCapacity = Batches.Sum(b => b.TotalQuantity);
                if (totalBatchCapacity > MaxParticipants)
                    errors.Add($"Total batch capacity ({totalBatchCapacity}) exceeds event maximum capacity ({MaxParticipants})");
            }

            // Image URL validation
            if (!string.IsNullOrEmpty(ImageUrl))
            {
                if (!Uri.TryCreate(ImageUrl, UriKind.Absolute, out var uriResult) ||
                    (!uriResult.Scheme.Equals(Uri.UriSchemeHttp, StringComparison.OrdinalIgnoreCase) &&
                     !uriResult.Scheme.Equals(Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase)))
                {
                    errors.Add("Image URL must be a valid HTTP/HTTPS URL");
                }
            }

            // Organizer validation
            if (OrganizerId == Guid.Empty)
                errors.Add("Event must have an organizer");

            // Category validation
            if (!Enum.IsDefined(typeof(EventCategory), Category))
                errors.Add("Invalid event category");

            // Batch validation
            if (Batches.Any())
            {
                foreach (var batch in Batches)
                {
                    if (!batch.Validate(out var batchErrors))
                    {
                        errors.AddRange(batchErrors.Select(error => $"Batch '{batch.Name}': {error}"));
                    }
                }
            }

            return errors.Count == 0 && isValid;
        }

        public int GetAvailableTickets()
        {
            var totalSold = Batches.Sum(b => b.TotalQuantity - b.Stock);
            return MaxParticipants - totalSold;
        }

        public bool CanSellTickets()
        {
            return IsActive && !HasEnded && HasAvailableTickets;
        }

        public bool HasSoldTickets()
        {
            return Batches.Any(b => b.Tickets.Any(t => t.Status != TicketStatus.Canceled));
        }

        public bool IsUserRole(Guid userId)
        {
            return EventRoles.Any(er => er.UserId == userId);
        }

        public EventRoleType GetUserRoles(Guid userId)
        {
            return EventRoles.Where(er => er.UserId == userId)
                           .Select(er => er.RoleType)
                           .Aggregate(EventRoleType.None, (current, next) => current | next);
        }

        // Domain methods
        public void Activate() => IsActive = true;
        public void Deactivate() => IsActive = false;

        public Batch AddBatch(string name, BatchType type, decimal unitPrice, int totalQuantity)
        {
            var batch = new Batch(this, name, type, unitPrice, totalQuantity) { Name = name, Type = type };
            if (!batch.Validate(out var errors))
                throw new ArgumentException(string.Join(Environment.NewLine, errors));

            ((List<Batch>)Batches).Add(batch);
            return batch;
        }

        public void AssignRole(User user, EventRoleType roleType)
        {
            if (EventRoles.Any(er => er.UserId == user.Id))
                throw new InvalidOperationException("User already has a role in this event");

            var eventRole = new EventRole
            {
                EventId = Id,
                UserId = user.Id,
                RoleType = roleType
            };

            ((List<EventRole>)EventRoles).Add(eventRole);
        }

        public void UpdateDates(DateTime eventDate, DateTime endDate)
        {
            if (HasStarted)
                throw new InvalidOperationException("Cannot update dates of an event that has already started");

            EventDate = eventDate.ToUniversalTime();
            EndDate = endDate.ToUniversalTime();
            
            if (!Validate(out var errors))
                throw new ArgumentException(string.Join(Environment.NewLine, errors));
        }

        public void UpdateCapacity(int newMaxParticipants)
        {
            if (newMaxParticipants < Batches.Sum(b => b.TotalQuantity - b.Stock))
                throw new InvalidOperationException("New capacity cannot be less than tickets already sold");

            MaxParticipants = newMaxParticipants;
        }

        // Batch management methods
        public Batch CreateBatch(string name, BatchType type, decimal unitPrice, int totalQuantity, DateTime? startDate = null, DateTime? endDate = null)
        {
            // Common validations
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Batch name is required");
            if (totalQuantity <= 0)
                throw new ArgumentException("Batch total quantity must be greater than zero");

            // Type-specific logic and validation
            switch (type)
            {
                case BatchType.Free:
                    unitPrice = 0; // Always free
                    // Allow dates only if both are provided (date restriction)
                    if ((startDate.HasValue && !endDate.HasValue) || (!startDate.HasValue && endDate.HasValue))
                        throw new InvalidOperationException("Both start and end dates must be provided for date-restricted free batches");
                    if (startDate.HasValue && endDate.HasValue)
                    {
                        if (startDate.Value < DateTime.UtcNow)
                            throw new InvalidOperationException("Batch start date cannot be in the past");
                        if (endDate.Value > EndDate)
                            throw new InvalidOperationException("Batch end date cannot be after event end date");
                        if (startDate.Value >= endDate.Value)
                            throw new InvalidOperationException("Batch start date must be before end date");
                    }
                    break;
                case BatchType.Quantity:
                    if (unitPrice < 0)
                        throw new ArgumentException("Batch unit price cannot be negative");
                    if (startDate.HasValue || endDate.HasValue)
                        throw new InvalidOperationException("Quantity batches cannot have start or end dates");
                    break;
                case BatchType.TimeWindow:
                    if (unitPrice < 0)
                        throw new ArgumentException("Batch unit price cannot be negative");
                    if (!startDate.HasValue || !endDate.HasValue)
                        throw new InvalidOperationException("TimeWindow batches must have both start and end dates");
                    if (startDate.Value < DateTime.UtcNow)
                        throw new InvalidOperationException("Batch start date cannot be in the past");
                    if (endDate.Value > EndDate)
                        throw new InvalidOperationException("Batch end date cannot be after event end date");
                    if (startDate.Value >= endDate.Value)
                        throw new InvalidOperationException("Batch start date must be before end date");
                    break;
                default:
                    throw new ArgumentException($"Unknown batch type: {type}");
            }

            var batch = new Batch(this, name, type, unitPrice, totalQuantity)
            {
                Name = name,
                Type = type,
                TotalQuantity = totalQuantity,
                Stock = totalQuantity,
                IsActive = true,
                StartDate = startDate,
                EndDate = endDate
            };

            Batches.Add(batch);
            return batch;
        }

        public void UpdateBatch(Guid batchId, string? name = null, decimal? unitPrice = null,
            int? totalQuantity = null, DateTime? startDate = null, DateTime? endDate = null,
            bool? isActive = null, BatchType? type = null)
        {
            var batch = Batches.FirstOrDefault(b => b.Id == batchId)
                ?? throw new InvalidOperationException("Batch not found");

            if (batch.HasEnded)
                throw new InvalidOperationException("Cannot update an ended batch");

            if (name != null)
                batch.Name = name;

            if (unitPrice.HasValue)
                batch.UnitPrice = unitPrice.Value;

            if (totalQuantity.HasValue)
            {
                if (batch.Tickets.Any(t => t.Status != TicketStatus.Canceled))
                    throw new InvalidOperationException("Cannot update quantity of batch with sold tickets");

                batch.TotalQuantity = totalQuantity.Value;
                batch.Stock = totalQuantity.Value;
            }

            if (startDate.HasValue)
            {
                if (startDate.Value < DateTime.UtcNow)
                    throw new InvalidOperationException("Batch start date cannot be in the past");

                batch.StartDate = startDate;
            }

            if (endDate.HasValue)
            {
                if (endDate.Value > EndDate)
                    throw new InvalidOperationException("Batch end date cannot be after event end date");

                batch.EndDate = endDate;
            }

            if (startDate.HasValue && endDate.HasValue && startDate.Value >= endDate.Value)
                throw new InvalidOperationException("Batch start date must be before end date");

            if (isActive.HasValue)
                batch.IsActive = isActive.Value;
                
            if (type.HasValue)
                batch.Type = type.Value;
        }

        public void RemoveBatch(Guid batchId)
        {
            var batch = Batches.FirstOrDefault(b => b.Id == batchId)
                ?? throw new InvalidOperationException("Batch not found");

            if (batch.Tickets.Any(t => t.Status != TicketStatus.Canceled))
                throw new InvalidOperationException("Cannot remove batch with sold tickets");

            Batches.Remove(batch);
        }
    }
}
