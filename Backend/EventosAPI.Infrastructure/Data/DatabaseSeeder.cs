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
            // --- USERS ---
            var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == "admin@eventos.com");
            if (adminUser == null)
            {
                adminUser = new User
                {
                    Name = "Administrador",
                    Email = "admin@eventos.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Role = UserRole.Admin,
                    Phone = "(11) 99999-9999"
                };
                _context.Users.Add(adminUser);
                await _context.SaveChangesAsync();
            }

            var normalUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == "user@eventos.com");
            if (normalUser == null)
            {
                normalUser = new User
                {
                    Name = "Usuário Teste",
                    Email = "user@eventos.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
                    Role = UserRole.User,
                    Phone = "(11) 88888-8888"
                };
                _context.Users.Add(normalUser);
                await _context.SaveChangesAsync();
            }

            // --- EVENTS ---
            var eventName = "Workshop de Programação";
            var evento = await _context.Events
                .Include(e => e.Batches)
                .FirstOrDefaultAsync(e => e.Name == eventName);

            if (evento == null)
            {
                var eventDate = DateTime.UtcNow.AddDays(30);
                var endDate = eventDate.AddHours(4);
                evento = new Event(
                    name: eventName,
                    description: "Aprenda programação com os melhores",
                    location: "São Paulo, SP",
                    eventDate: eventDate,
                    endDate: endDate,
                    organizer: adminUser,
                    maxParticipants: 100,
                    category: EventCategory.Technology
                )
                {
                    Name = eventName,
                    Description = "Aprenda programação com os melhores",
                    Location = "São Paulo, SP",
                    ImageUrl = "https://example.com/workshop.jpg"
                };

                // Add batches
                var batch1EndDate = eventDate.AddDays(-6);
                var batch2EndDate = eventDate.AddDays(-1);

                evento.CreateBatch(
                    name: "Lote 1",
                    type: BatchType.TimeWindow,
                    unitPrice: 50.0m,
                    totalQuantity: 50,
                    startDate: eventDate.AddDays(-10),
                    endDate: batch1EndDate
                );
                evento.CreateBatch(
                    name: "Lote 2",
                    type: BatchType.TimeWindow,
                    unitPrice: 70.0m,
                    totalQuantity: 30,
                    startDate: batch1EndDate,
                    endDate: batch2EndDate
                );

                _context.Events.Add(evento);
                await _context.SaveChangesAsync();
            }

            // --- EVENT ROLES ---
            var rolesToSeed = new[]
            {
                new { UserId = normalUser.Id, EventId = evento.Id, RoleType = EventRoleType.ManageTickets },
                new { UserId = normalUser.Id, EventId = evento.Id, RoleType = EventRoleType.ViewReports }
            };

            foreach (var role in rolesToSeed)
            {
                bool exists = await _context.EventRoles.AnyAsync(er =>
                    er.UserId == role.UserId && er.EventId == role.EventId && er.RoleType == role.RoleType);
                if (!exists)
                {
                    _context.EventRoles.Add(new EventRole
                    {
                        UserId = role.UserId,
                        EventId = role.EventId,
                        RoleType = role.RoleType
                    });
                }
            }
            await _context.SaveChangesAsync();
        }
    }
}