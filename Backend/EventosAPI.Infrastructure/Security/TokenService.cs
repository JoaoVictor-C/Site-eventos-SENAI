using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using EventosAPI.Domain.Entities;
using EventosAPI.Domain.Interfaces.Services;
using EventosAPI.Infrastructure.Data;

namespace EventosAPI.Infrastructure.Security
{
    public class TokenService : ITokenService
    {
        private const string ReauthPurposeClaim = "reauth_purpose";
        private const string ReauthTokenTypeClaim = "reauth";

        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;

        public TokenService(IConfiguration configuration, ApplicationDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        public string GenerateAccessToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? 
                throw new ArgumentNullException("Jwt:Key", "JWT Key configuration is missing");
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? 
                throw new ArgumentNullException("Jwt:Issuer", "JWT Issuer configuration is missing");
            var jwtAudience = _configuration["Jwt:Audience"] ?? 
                throw new ArgumentNullException("Jwt:Audience", "JWT Audience configuration is missing");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: GetAccessTokenExpiration(),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateReauthToken(Guid userId, string purpose, int expiresInMinutes = 5)
        {
            if (string.IsNullOrWhiteSpace(purpose))
                throw new ArgumentException("Purpose is required", nameof(purpose));

            var jwtKey = _configuration["Jwt:Key"] ??
                throw new ArgumentNullException("Jwt:Key", "JWT Key configuration is missing");
            var jwtIssuer = _configuration["Jwt:Issuer"] ??
                throw new ArgumentNullException("Jwt:Issuer", "JWT Issuer configuration is missing");
            var jwtAudience = _configuration["Jwt:Audience"] ??
                throw new ArgumentNullException("Jwt:Audience", "JWT Audience configuration is missing");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ReauthPurposeClaim, purpose),
                new Claim("typ", ReauthTokenTypeClaim),
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiresInMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public ClaimsPrincipal? ValidateReauthToken(string token, string expectedPurpose)
        {
            if (string.IsNullOrWhiteSpace(token))
                return null;

            var jwtKey = _configuration["Jwt:Key"] ??
                throw new ArgumentNullException("Jwt:Key", "JWT Key configuration is missing");
            var jwtIssuer = _configuration["Jwt:Issuer"] ??
                throw new ArgumentNullException("Jwt:Issuer", "JWT Issuer configuration is missing");
            var jwtAudience = _configuration["Jwt:Audience"] ??
                throw new ArgumentNullException("Jwt:Audience", "JWT Audience configuration is missing");

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                ClockSkew = TimeSpan.Zero
            };

            try
            {
                var handler = new JwtSecurityTokenHandler();
                var principal = handler.ValidateToken(token, tokenValidationParameters, out _);

                var purpose = principal.FindFirstValue(ReauthPurposeClaim);
                if (!string.Equals(purpose, expectedPurpose, StringComparison.Ordinal))
                    return null;

                var typ = principal.FindFirstValue("typ");
                if (!string.Equals(typ, ReauthTokenTypeClaim, StringComparison.Ordinal))
                    return null;

                return principal;
            }
            catch
            {
                return null;
            }
        }

        public string GenerateRefreshToken()
        {
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes);
        }

        public async Task<RefreshToken> CreateRefreshTokenAsync(User user)
        {
            var refreshToken = new RefreshToken
            {
                Token = GenerateRefreshToken(),
                ExpiryDate = DateTime.UtcNow.AddDays(30), // 30 days for refresh token
                UserId = user.Id
            };

            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();

            return refreshToken;
        }

        public async Task<RefreshToken?> GetRefreshTokenAsync(string token)
        {
            return await _context.RefreshTokens
                .Include(r => r.User)
                .SingleOrDefaultAsync(r => r.Token == token);
        }

        public string? ValidateRefreshToken(string token)
        {
            if (string.IsNullOrEmpty(token))
                return null;

            var refreshToken = _context.RefreshTokens
                .Include(r => r.User)
                .SingleOrDefault(r => r.Token == token);

            if (refreshToken == null || !refreshToken.IsActive)
                return null;

            return token;
        }

        public async Task<bool> RevokeTokenAsync(string token)
        {
            var refreshToken = await _context.RefreshTokens
                .SingleOrDefaultAsync(r => r.Token == token);

            if (refreshToken == null)
                return false;

            refreshToken.IsRevoked = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task RevokeAllUserTokensAsync(Guid userId, string reason)
        {
            var userTokens = await _context.RefreshTokens
                .Where(t => t.UserId == userId && !t.IsRevoked)
                .ToListAsync();

            foreach (var token in userTokens)
            {
                token.IsRevoked = true;
                token.ReasonRevoked = reason;
                token.RevokedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        public DateTime GetAccessTokenExpiration()
        {
            var expiresInHours = _configuration.GetValue("Jwt:ExpiresInHours", 24);
            return DateTime.UtcNow.AddHours(expiresInHours);
        }
    }
}
