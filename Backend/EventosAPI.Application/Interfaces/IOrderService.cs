using EventosAPI.Application.DTOs;

namespace EventosAPI.Application.Interfaces
{
    public interface IOrderService
    {
        Task<OrderDto> GetByIdAsync(Guid id);
        Task<IEnumerable<OrderDto>> GetUserOrdersAsync(Guid userId);
        Task<OrderDto> CreateOrderAsync(CreateOrderDto createOrderDto);
        Task<OrderDto> UpdateOrderAsync(Guid id, UpdateOrderDto updateOrderDto);
        Task<bool> ValidateOrderAsync(Guid orderId, Guid validatedByUserId);
        Task<IEnumerable<OrderSummaryDto>> GetEventOrdersAsync(Guid eventId);
    }
}
