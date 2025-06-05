using EventosAPI.Domain.Entities;
using EventosAPI.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EventosAPI.Infrastructure.Data
{
    public class DatabaseSeeder
    {
        private readonly ApplicationDbContext _context;

        public DatabaseSeeder(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task SeedAsync()
        {
            if (!_context.Users.Any())
            {
                var adminUser = new User
                {
                    Name = "Administrador",
                    Email = "admin@eventos.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Role = UserRole.Admin,
                    Phone = "(11) 99999-9999"
                };

                var normalUser = new User
                {
                    Name = "Usuário Teste",
                    Email = "user@eventos.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
                    Role = UserRole.User,
                    Phone = "(11) 88888-8888"
                };

                _context.Users.AddRange(adminUser, normalUser);
                await _context.SaveChangesAsync();

                var evento = new Event
                {
                    Name = "Workshop de Programação",
                    Description = "Aprenda programação com os melhores",
                    EventDate = DateTime.UtcNow.AddDays(30),
                    EndDate = DateTime.UtcNow.AddDays(30).AddHours(4),
                    Location = "São Paulo, SP",
                    Category = EventCategory.Technology,
                    MaxParticipants = 100,
                    OrganizerId = adminUser.Id
                };

                _context.Events.Add(evento);
                await _context.SaveChangesAsync();

                var lote = new Batch
                {
                    Name = "Lote 1",
                    EventId = evento.Id,
                    UnitPrice = 50.00M,
                    TotalQuantity = 50,
                    Stock = 50,
                    StartDate = DateTime.UtcNow,
                    EndDate = evento.EventDate,
                    Type = BatchType.Quantity
                };

                _context.Batches.Add(lote);
                await _context.SaveChangesAsync();
            }
        }
    }
}
