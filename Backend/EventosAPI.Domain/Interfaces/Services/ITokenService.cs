using System;
using System.Threading.Tasks;
using EventosAPI.Domain.Entities;

namespace EventosAPI.Domain.Interfaces.Services
{
    public interface ITokenService
    {
        string GenerateAccessToken(User user);
        string GenerateRefreshToken();
        Task<RefreshToken> CreateRefreshTokenAsync(User user);
        Task<RefreshToken?> GetRefreshTokenAsync(string token);
        Task<bool> RevokeTokenAsync(string token);
        Task RevokeAllUserTokensAsync(Guid userId, string reason);
        DateTime GetAccessTokenExpiration();
    }
}
