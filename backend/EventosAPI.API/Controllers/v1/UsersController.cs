using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EventosAPI.Application.DTOs;
using EventosAPI.Application.Interfaces;

namespace EventosAPI.API.Controllers.v1
{
    public class UsersController : ApiControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] CreateUserDto createUserDto)
        {
            try
            {
                var user = await _userService.CreateAsync(createUserDto);
                return HandleSuccess(user, "Usuário registrado com sucesso");
            }
            catch (Exception ex)
            {
                return HandleError(ex.Message);
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                var result = await _userService.LoginAsync(loginDto);
                return HandleSuccess(result, "Login realizado com sucesso");
            }
            catch (Exception ex)
            {
                return HandleError(ex.Message);
            }
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var user = await _userService.GetCurrentUserAsync();
                return HandleSuccess(user);
            }
            catch (Exception ex)
            {
                return HandleError(ex.Message);
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var users = await _userService.GetAllAsync();
                return HandleSuccess(users);
            }
            catch (Exception ex)
            {
                return HandleError(ex.Message);
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var user = await _userService.GetByIdAsync(id);
                if (user == null)
                    return HandleError("Usuário não encontrado", 404);

                return HandleSuccess(user);
            }
            catch (Exception ex)
            {
                return HandleError(ex.Message);
            }
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserDto updateUserDto)
        {
            try
            {
                await _userService.UpdateAsync(id, updateUserDto);
                return HandleSuccess(message: "Usuário atualizado com sucesso");
            }
            catch (Exception ex)
            {
                return HandleError(ex.Message);
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _userService.DeleteAsync(id);
                return HandleSuccess(message: "Usuário deletado com sucesso");
            }
            catch (Exception ex)
            {
                return HandleError(ex.Message);
            }
        }
    }
}
