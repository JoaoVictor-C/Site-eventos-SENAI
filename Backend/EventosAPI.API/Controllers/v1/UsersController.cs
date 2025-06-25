using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EventosAPI.Application.DTOs;
using EventosAPI.Application.Interfaces;

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
                return HandleError("Forbidden", 403);
            var users = await _userService.GetAllAsync();
            return HandleSuccess(users);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid id)
        {
            if (!IsCurrentUserAdmin())
                return HandleError("Forbidden", 403);
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
                return HandleError("Usuário não encontrado", 404);
            return HandleSuccess(user);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserDto updateUserDto)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId != id && !IsCurrentUserAdmin())
                return HandleError("Forbidden", 403);
            await _userService.UpdateAsync(id, updateUserDto);
            return HandleSuccess<object>(null, "Usuário atualizado com sucesso");
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == id)
                return HandleError("Você não pode excluir sua própria conta", 403);
            if (!IsCurrentUserAdmin())
                return HandleError("Forbidden", 403);
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
                return HandleError("Usuário não encontrado", 404);
            await _userService.DeleteAsync(id);
            return HandleSuccess<object>(null, "Usuário excluído com sucesso");
        }

        [HttpPost("{id}/reset-password")]
        [Authorize]
        public async Task<IActionResult> ResetUserPassword(Guid id)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId != id && !IsCurrentUserAdmin())
                return HandleError("Forbidden", 403);
            await _userService.ResetUserPasswordAsync(id);
            return HandleSuccess<object>(null, "Password reset successful. A new password has been sent to the user's email.");
        }
    }
}
