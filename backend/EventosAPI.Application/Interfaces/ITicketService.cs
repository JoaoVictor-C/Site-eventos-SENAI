using EventosAPI.Application.DTOs;

namespace EventosAPI.Application.Interfaces
{
    public interface ITicketService
    {
        Task<TicketDto> GetByIdAsync(Guid id);
        Task<IEnumerable<TicketDto>> GetUserTicketsAsync(Guid userId);
        Task<TicketDto> CreateTicketAsync(CreateTicketDto createTicketDto, Guid userId);
        Task<bool> ValidateTicketQrCodeAsync(string qrCode);
        Task UseTicketAsync(Guid ticketId);
        Task<IEnumerable<TicketDto>> GetEventTicketsAsync(Guid eventId);
    }
}
