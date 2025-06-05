using System;

namespace EventosAPI.Domain.Entities
{
    public class RefreshToken : BaseEntity
    {
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiryDate { get; set; }
        public bool IsRevoked { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public string? ReplacedByToken { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsExpired => DateTime.UtcNow >= ExpiryDate;
        public bool IsActive => !IsRevoked && !IsExpired;
    }
}
