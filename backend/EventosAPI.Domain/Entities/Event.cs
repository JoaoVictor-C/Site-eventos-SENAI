using EventosAPI.Domain.Enums;

namespace EventosAPI.Domain.Entities
{
    public class Event : BaseEntity
    {
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime EventDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? ImageUrl { get; set; }
        public string Location { get; set; } = null!;
        public bool IsActive { get; set; }
        public int MaxParticipants { get; set; }
        public EventCategory Category { get; set; }
        
        public Guid OrganizerId { get; set; }
        public virtual User Organizer { get; set; } = null!;
        public virtual ICollection<Batch> Batches { get; set; }

        public Event()
        {
            IsActive = true;
            MaxParticipants = 0;
            Category = EventCategory.Other;
            Batches = new List<Batch>();
        }
    }
}
