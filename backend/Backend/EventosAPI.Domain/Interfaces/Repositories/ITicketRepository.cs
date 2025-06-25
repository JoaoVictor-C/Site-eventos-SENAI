using EventosAPI.Domain.Entities;

namespace EventosAPI.Domain.Interfaces.Repositories
{
    public interface ITicketRepository : IBaseRepository<Ticket>
    {
        Task<IEnumerable<Ticket>> GetByUserIdAsync(Guid userId);
        Task<IEnumerable<Ticket>> GetByEventIdAsync(Guid eventId);
        Task<Ticket?> GetByQRCodeAsync(string qrCode);
        Task<bool> QRCodeExistsAsync(string qrCode);
    }
}
