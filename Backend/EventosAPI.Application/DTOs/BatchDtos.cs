using EventosAPI.Domain.Enums;

namespace EventosAPI.Application.DTOs
{
    public class BatchDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public Guid EventId { get; set; }
        public decimal UnitPrice { get; set; }
        public int TotalQuantity { get; set; }
        public int Stock { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public BatchType Type { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateBatchDto
    {
        public string Name { get; set; } = null!;
        public Guid EventId { get; set; }
        public decimal UnitPrice { get; set; }
        public int TotalQuantity { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public BatchType Type { get; set; }
    }

    public class UpdateBatchDto
    {
        public string? Name { get; set; }
        public decimal? UnitPrice { get; set; }
        public int? TotalQuantity { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public BatchType? Type { get; set; }
        public bool? IsActive { get; set; }
    }

    public class BatchSummaryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public decimal UnitPrice { get; set; }
        public int AvailableQuantity { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
    }
}
