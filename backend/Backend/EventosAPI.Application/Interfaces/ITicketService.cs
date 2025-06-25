using EventosAPI.Application.DTOs;
using EventosAPI.Domain.Entities;

namespace EventosAPI.Application.Interfaces
{
    public interface ITicketService
    {
        Task<IEnumerable<TicketDto>> GetTicketsByUserAsync(Guid userId);
        Task<IEnumerable<TicketDto>> GetTicketsByEventAsync(Guid eventId);
        Task<OrderDto?> GetOrderAsync(Guid orderId);
        
        Task<TicketReservationResponseDto> ReserveTicketsAsync(TicketReservationDto reservationDto, Guid userId);
        Task ValidateTicketPaymentAsync(TicketValidationDto validationDto, Guid validatorId);
        Task CancelReservationAsync(Guid orderId, Guid userId);
        
        // Admin methods
        Task<IEnumerable<OrderDto>> GetAllOrdersAsync();
        Task<IEnumerable<OrderDto>> GetOrdersByEventAsync(Guid eventId);
        
        // Internal methods
        Task<TicketDto> CreateTicketAsync(CreateTicketDto createTicketDto, Guid userId);
        Task<bool> ValidateTicketAsync(Guid ticketId, Guid validatorId);
        Task<TicketDto> GetTicketByIdAsync(Guid ticketId);
    }
}
