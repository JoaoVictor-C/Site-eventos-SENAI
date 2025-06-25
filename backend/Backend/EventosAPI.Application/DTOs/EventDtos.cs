using System.ComponentModel.DataAnnotations;
using EventosAPI.Domain.Enums;

namespace EventosAPI.Application.DTOs
{
    public class EventDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime EventDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Location { get; set; } = null!;
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; }
        public EventCategory Category { get; set; }
        public int MaxParticipants { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public UserDto Organizer { get; set; } = null!;
        public ICollection<BatchDto>? Batches { get; set; }
        public int AvailableTickets { get; set; }
    }

    public class CreateEventDto
    {
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime EventDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Location { get; set; } = null!;
        public string? ImageUrl { get; set; }
        public EventCategory Category { get; set; }
        public int MaxParticipants { get; set; }
    }

    public class UpdateEventDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime? EventDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Location { get; set; }
        public string? ImageUrl { get; set; }
        public EventCategory? Category { get; set; }
        public int? MaxParticipants { get; set; }
        public bool? IsActive { get; set; }
        public ICollection<BatchDto>? Batches { get; set; }
    }

    public class EventSummaryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public DateTime EventDate { get; set; }
        public string Location { get; set; } = null!;
        public decimal LowestPrice { get; set; }
        public int AvailableTickets { get; set; }
    }

    public class AdminEventManagementDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string Category { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public int TotalTickets { get; set; }
        public int AvailableTickets { get; set; }
    }
}
