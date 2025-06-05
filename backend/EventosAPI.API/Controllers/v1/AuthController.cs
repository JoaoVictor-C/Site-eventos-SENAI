using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EventosAPI.Application.DTOs;
using EventosAPI.Application.Interfaces;
using EventosAPI.Domain.Interfaces.Services;

namespace EventosAPI.API.Controllers.v1
{
    public class AuthController : ApiControllerBase
    {
        private readonly IUserService _userService;
        private readonly ITokenService _tokenService;

        public AuthController(IUserService userService, ITokenService tokenService)
        {
            _userService = userService;
            _tokenService = tokenService;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<TokenResponseDto>> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                var response = await _userService.LoginAsync(loginDto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<ActionResult<TokenResponseDto>> RefreshToken([FromBody] RefreshTokenRequestDto request)
        {
            var refreshToken = await _tokenService.GetRefreshTokenAsync(request.RefreshToken);
            
            if (refreshToken == null || !refreshToken.IsActive)
                return BadRequest(new { message = "Invalid refresh token" });

            var user = refreshToken.User;
            var newAccessToken = _tokenService.GenerateAccessToken(user);
            var newRefreshToken = await _tokenService.CreateRefreshTokenAsync(user);

            // Revoke the old refresh token
            await _tokenService.RevokeTokenAsync(request.RefreshToken);

            return Ok(new TokenResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken.Token,
                AccessTokenExpiration = _tokenService.GetAccessTokenExpiration(),
                User = new UserDto 
                { 
                    Id = user.Id,
                    Email = user.Email,
                    Name = user.Name,
                    Role = user.Role.ToString()
                }
            });
        }

        [HttpPost("revoke-token")]
        [Authorize]
        public async Task<IActionResult> RevokeToken([FromBody] RevokeTokenRequestDto request)
        {
            var result = await _tokenService.RevokeTokenAsync(request.RefreshToken);
            if (!result)
                return BadRequest(new { message = "Token not found" });

            return Ok(new { message = "Token revoked" });
        }
    }
}
