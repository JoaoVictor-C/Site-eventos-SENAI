using EventosAPI.Domain.Entities;

namespace EventosAPI.Domain.Interfaces.Repositories
{
    public interface IOrderRepository : IBaseRepository<Order>
    {
        Task<IEnumerable<Order>> GetUserOrdersAsync(Guid userId);
        Task<IEnumerable<Order>> GetEventOrdersAsync(Guid eventId);
    }
}
