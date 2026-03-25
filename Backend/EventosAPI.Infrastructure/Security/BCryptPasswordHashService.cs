using EventosAPI.Domain.Interfaces.Services;

namespace EventosAPI.Infrastructure.Security
{
    public class BCryptPasswordHashService : IPasswordHashService
    {
        private const int WorkFactor = 12; // Standard work factor, can be adjusted based on security requirements

        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }
    }
}
