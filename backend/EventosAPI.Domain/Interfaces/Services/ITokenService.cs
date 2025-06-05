using EventosAPI.Domain.Entities;

namespace EventosAPI.Domain.Interfaces.Services
{
    public interface ITokenService
    {
        string GenerateAccessToken(User user);
        string GenerateRefreshToken();
        string? ValidateRefreshToken(string token);
        Task<RefreshToken?> GetRefreshTokenAsync(string token);
        Task<bool> RevokeTokenAsync(string token);
        Task<RefreshToken> CreateRefreshTokenAsync(User user);
        DateTime GetAccessTokenExpiration();
    }
}
