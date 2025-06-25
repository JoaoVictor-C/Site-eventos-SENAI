using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Google.Authenticator;
using Microsoft.AspNetCore.Mvc;
using EventosAPI.Application.DTOs;
using EventosAPI.Application.Interfaces;
using EventosAPI.Domain.Entities;
using System.Security.Claims;
using EventosAPI.Domain.Interfaces.Services;

namespace EventosAPI.API.Controllers.v1
{
    [Route("api/v1/auth/google")]
    public class GoogleAuthController : Controller
    {
        private readonly IUserService _userService;
        private readonly ITokenService _tokenService;
        private readonly IConfiguration _configuration;

        public GoogleAuthController(IUserService userService, ITokenService tokenService, IConfiguration configuration)
        {
            _userService = userService;
            _tokenService = tokenService;
            _configuration = configuration;
        }

        // GET: api/v1/auth/google/setup?email=user@example.com
        [HttpGet("setup")]
        public async Task<IActionResult> Setup2FA([FromQuery] string email)
        {
            // 1. Find user by email
            var user = await _userService.GetByEmailAsync(email);
            if (user == null)
                return NotFound("Usuário não encontrado");

            // 2. Use existing secret or generate a new one
            string key = user.TwoFactorSecret;
            if (string.IsNullOrEmpty(key))
            {
                key = Guid.NewGuid().ToString().Replace("-", "").Substring(0, 10);
                // Save the secret to the user (implement this in your service/repository)
                await _userService.SetTwoFactorSecretAsync(user.Id, key);
            }

            var tfa = new TwoFactorAuthenticator();
            var setupInfo = tfa.GenerateSetupCode("EventosApp", email, key, false, 3);

            return Ok(new
            {
                qrCodeImageUrl = setupInfo.QrCodeSetupImageUrl,
                manualEntryKey = setupInfo.ManualEntryKey
                // Do NOT send the secret to the client
            });
        }

        // POST: api/v1/auth/google/verify
        [HttpPost("verify")]
        public async Task<IActionResult> Verify2FA([FromBody] Verify2FARequest request)
        {
            // 1. Retrieve the user's secret key from DB by email
            var user = await _userService.GetByEmailAsync(request.Email);
            if (user == null || string.IsNullOrEmpty(user.TwoFactorSecret))
                return BadRequest("2FA não configurado para este usuário");
            var tfa = new TwoFactorAuthenticator();
            bool isValid = tfa.ValidateTwoFactorPIN(user.TwoFactorSecret, request.Code);
            return Ok(new { valid = isValid });
        }

        public class Verify2FARequest
        {
            public string Email { get; set; }
            public string Code { get; set; }
        }
    }
}
