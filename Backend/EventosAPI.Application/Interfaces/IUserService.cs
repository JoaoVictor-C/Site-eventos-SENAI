using EventosAPI.Application.DTOs;
using EventosAPI.Domain.Entities;

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
        Task<bool> VerifyPasswordAsync(Guid userId, string password);
        Task ResetUserPasswordAsync(Guid userId);
        Task<User> GetByEmailAsync(string email);
        Task SetTwoFactorSecretAsync(Guid userId, string secret);
    }
}
