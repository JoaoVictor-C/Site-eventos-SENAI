using EventosAPI.Application.DTOs;

namespace EventosAPI.Application.Interfaces
{
    public interface IUserService
    {
        Task<UserDto> GetByIdAsync(Guid id);
        Task<IEnumerable<UserDto>> GetAllAsync();
        Task<UserDto> CreateAsync(CreateUserDto createUserDto);
        Task UpdateAsync(Guid id, UpdateUserDto updateUserDto);
        Task DeleteAsync(Guid id);
        Task<TokenResponseDto> LoginAsync(LoginDto loginDto);
        Task<UserDto> GetCurrentUserAsync();
    }
}
