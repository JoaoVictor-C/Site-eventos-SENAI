namespace EventosAPI.Application.DTOs
{
    public class TokenResponseDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime AccessTokenExpiration { get; set; }
        public UserDto User { get; set; } = null!;
    }

    public class RefreshTokenRequestDto
    {
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class RevokeTokenRequestDto
    {
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class ReauthRequestDto
    {
        public string Password { get; set; } = string.Empty;
    }

    public class ReauthResponseDto
    {
        public string ReauthToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }
}
