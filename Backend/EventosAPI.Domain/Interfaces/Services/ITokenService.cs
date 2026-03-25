using System;
using System.Threading.Tasks;
using EventosAPI.Domain.Entities;
using System.Security.Claims;

namespace EventosAPI.Domain.Interfaces.Services
{
    public interface ITokenService
    {
        string GenerateAccessToken(User user);
        string GenerateReauthToken(Guid userId, string purpose, int expiresInMinutes = 5);
        ClaimsPrincipal? ValidateReauthToken(string token, string expectedPurpose);
        string GenerateRefreshToken();
        Task<RefreshToken> CreateRefreshTokenAsync(User user);
        Task<RefreshToken?> GetRefreshTokenAsync(string token);
        Task<bool> RevokeTokenAsync(string token);
        Task RevokeAllUserTokensAsync(Guid userId, string reason);
        DateTime GetAccessTokenExpiration();
    }
}
