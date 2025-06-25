using EventosAPI.Application.DTOs;

namespace EventosAPI.Application.Interfaces
{
    public interface IBatchService
    {
        Task<BatchDto> CreateAsync(CreateBatchDto createBatchDto);
        Task<BatchDto> UpdateAsync(Guid id, UpdateBatchDto updateBatchDto);
        Task<BatchDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<BatchDto>> GetByEventIdAsync(Guid eventId);
        Task DeleteAsync(Guid id);
    }
}
