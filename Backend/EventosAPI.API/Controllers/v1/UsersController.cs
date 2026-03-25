using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EventosAPI.Application.DTOs;
using EventosAPI.Application.Interfaces;
using AppUnauthorizedAccessException = EventosAPI.Application.Exceptions.UnauthorizedAccessException;

namespace EventosAPI.API.Controllers.v1
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class UsersController : ApiControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var user = await _userService.GetCurrentUserAsync();
            return HandleSuccess(user);
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            if (!IsCurrentUserAdmin())
                throw new AppUnauthorizedAccessException("Forbidden");

            var users = await _userService.GetAllAsync();
            return HandleSuccess(users);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid id)
        {
            if (!IsCurrentUserAdmin())
                throw new AppUnauthorizedAccessException("Forbidden");

            var user = await _userService.GetByIdAsync(id);
            return HandleSuccess(user);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserDto updateUserDto)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId != id && !IsCurrentUserAdmin())
                throw new AppUnauthorizedAccessException("Forbidden");

            await _userService.UpdateAsync(id, updateUserDto);
            return HandleSuccess<object>(null, "Usuário atualizado com sucesso");
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == id)
                throw new AppUnauthorizedAccessException("Você não pode excluir sua própria conta");

            if (!IsCurrentUserAdmin())
                throw new AppUnauthorizedAccessException("Forbidden");

            // Ensure it exists so we return a 404 if it's missing.
            _ = await _userService.GetByIdAsync(id);

            await _userService.DeleteAsync(id);
            return HandleSuccess<object>(null, "Usuário excluído com sucesso");
        }

        [HttpPost("{id}/reset-password")]
        [Authorize]
        public async Task<IActionResult> ResetUserPassword(Guid id)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId != id && !IsCurrentUserAdmin())
                throw new AppUnauthorizedAccessException("Forbidden");

            await _userService.ResetUserPasswordAsync(id);
            return HandleSuccess<object>(null,
                "Password reset successful. A new password has been sent to the user's email.");
        }
    }
}