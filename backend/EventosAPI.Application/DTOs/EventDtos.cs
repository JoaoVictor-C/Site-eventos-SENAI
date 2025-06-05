namespace EventosAPI.Application.DTOs
{
    public class EventDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int MaxParticipants { get; set; }
        public string Location { get; set; } = null!;
        public bool IsActive { get; set; }
        public Guid OrganizerId { get; set; }
        public UserDto Organizer { get; set; } = null!;
        public int AvailableTickets { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateEventDto
    {
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int MaxParticipants { get; set; }
        public string Location { get; set; } = null!;
    }

    public class UpdateEventDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? MaxParticipants { get; set; }
        public string? Location { get; set; }
        public bool? IsActive { get; set; }
    }
}
