using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using EventosAPI.Application.DTOs;
using EventosAPI.Application.Interfaces;
using EventosAPI.Domain.Interfaces.Services;
using NotFoundException = EventosAPI.Application.Exceptions.NotFoundException;
using ValidationException = EventosAPI.Application.Exceptions.ValidationException;

namespace EventosAPI.API.Controllers.v1
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AuthController : ApiControllerBase
    {
        private readonly IUserService _userService;
        private readonly ITokenService _tokenService;
        private readonly IConfiguration _configuration;

        public AuthController(IUserService userService, ITokenService tokenService, IConfiguration configuration)
        {
            _userService = userService;
            _tokenService = tokenService;
            _configuration = configuration;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var response = await _userService.LoginAsync(loginDto);
            return HandleSuccess(response, "Login realizado com sucesso");
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] CreateUserDto createUserDto)
        {
            var user = await _userService.CreateAsync(createUserDto);
            return HandleSuccess(user, "Usuário registrado com sucesso");
        }

        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
        {
            var refreshToken = await _tokenService.GetRefreshTokenAsync(request.RefreshToken);
            if (refreshToken == null || !refreshToken.IsActive)
                throw new ValidationException(new[] { "Invalid refresh token" });

            var user = refreshToken.User;
            var newAccessToken = _tokenService.GenerateAccessToken(user);
            var newRefreshToken = await _tokenService.CreateRefreshTokenAsync(user);

            await _tokenService.RevokeTokenAsync(request.RefreshToken);

            return HandleSuccess(new TokenResponseDto
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
            }, "Token refreshed successfully");
        }

        [HttpPost("revoke-token")]
        [Authorize]
        public async Task<IActionResult> RevokeToken([FromBody] RevokeTokenRequestDto request)
        {
            var result = await _tokenService.RevokeTokenAsync(request.RefreshToken);
            if (!result)
                throw new NotFoundException("RefreshToken", request.RefreshToken);

            return HandleSuccess<object>(null, "Token revoked");
        }

        // Re-auth step for sensitive operations (e.g., 2FA setup). Requires the user's password.
        [HttpPost("reauth/2fa")]
        [Authorize]
        public async Task<IActionResult> ReauthForTwoFactor([FromBody] ReauthRequestDto request)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrWhiteSpace(request.Password))
                throw new ValidationException(new[] { "Password is required" });

            var ok = await _userService.VerifyPasswordAsync(userId, request.Password);
            if (!ok)
                throw new ValidationException(new[] { "Invalid password" });

            var expiresInMinutes = _configuration.GetValue("TwoFactor:ReauthExpiresMinutes", 5);
            var token = _tokenService.GenerateReauthToken(userId, purpose: "2fa_setup", expiresInMinutes: expiresInMinutes);

            return HandleSuccess(new ReauthResponseDto
            {
                ReauthToken = token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(expiresInMinutes)
            });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = GetCurrentUserId();
            var user = await _userService.GetByIdAsync(userId);
            return HandleSuccess(user);
        }
    }
}
