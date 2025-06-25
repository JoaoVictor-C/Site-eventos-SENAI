using System.ComponentModel.DataAnnotations;

namespace EventosAPI.Application.Configuration
{
    public class JwtSettings
    {
        [Required, MinLength(32)]
        public string Key { get; set; } = string.Empty;

        [Required]
        public string Issuer { get; set; } = string.Empty;

        [Required]
        public string Audience { get; set; } = string.Empty;

        [Range(5, 24)]
        public int AccessTokenExpirationInHours { get; set; } = 5;

        [Range(1, 7)]
        public int RefreshTokenExpirationInDays { get; set; } = 7;

        public int TokenValidationClockSkewInMinutes { get; set; } = 5;
    }
}
