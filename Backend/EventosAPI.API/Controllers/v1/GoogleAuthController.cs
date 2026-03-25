using System.Security.Claims;
using System.Security.Cryptography;
using Google.Authenticator;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EventosAPI.Domain.Interfaces.Repositories;
using EventosAPI.Domain.Interfaces.Services;
using NotFoundException = EventosAPI.Application.Exceptions.NotFoundException;
using ValidationException = EventosAPI.Application.Exceptions.ValidationException;
using AppUnauthorizedAccessException = EventosAPI.Application.Exceptions.UnauthorizedAccessException;

namespace EventosAPI.API.Controllers.v1
{
    // NOTE: This controller implements TOTP (Google Authenticator compatible) 2FA setup/verification.
    // The route is kept for backward compatibility with existing clients.
    [ApiController]
    [Route("api/v1/auth/google")]
    [Authorize]
    public class GoogleAuthController : ApiControllerBase
    {
        private const int TwoFactorSecretLength = 20; // Common length for TOTP secrets
        private static readonly char[] Base32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".ToCharArray();

        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;

        public GoogleAuthController(IUserRepository userRepository, ITokenService tokenService)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
        }

        // GET: api/v1/auth/google/setup
        [HttpGet("setup")]
        public async Task<IActionResult> Setup2FA()
        {
            EnsureRecentReauth(purpose: "2fa_setup");

            // Security: do not allow configuring 2FA by arbitrary email. Always use the authenticated user.
            var userId = GetCurrentUserId();
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new NotFoundException("User", userId);

            // Use existing secret or generate a new one.
            var secret = user.TwoFactorSecret;
            if (string.IsNullOrEmpty(secret))
            {
                secret = GenerateBase32Secret(TwoFactorSecretLength);
                user.TwoFactorSecret = secret;
                await _userRepository.UpdateAsync(user);
            }

            var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value ?? user.Email;

            var tfa = new TwoFactorAuthenticator();
            var setupInfo = tfa.GenerateSetupCode("EventosApp", emailClaim, secret, false, 3);

            return HandleSuccess(new
            {
                qrCodeImageUrl = setupInfo.QrCodeSetupImageUrl,
                manualEntryKey = setupInfo.ManualEntryKey
            });
        }

        // POST: api/v1/auth/google/verify
        [HttpPost("verify")]
        public async Task<IActionResult> Verify2FA([FromBody] Verify2FARequest request)
        {
            var userId = GetCurrentUserId();
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || string.IsNullOrEmpty(user.TwoFactorSecret))
                throw new ValidationException(new[] { "2FA is not configured for this user" });

            var tfa = new TwoFactorAuthenticator();
            var isValid = tfa.ValidateTwoFactorPIN(user.TwoFactorSecret, request.Code);

            return HandleSuccess(new { valid = isValid });
        }

        public class Verify2FARequest
        {
            public string Code { get; set; } = null!;
        }

        private static string GenerateBase32Secret(int length)
        {
            var bytes = RandomNumberGenerator.GetBytes(length);
            var chars = new char[length];

            for (int i = 0; i < length; i++)
            {
                chars[i] = Base32Alphabet[bytes[i] % Base32Alphabet.Length];
            }

            return new string(chars);
        }

        private void EnsureRecentReauth(string purpose)
        {
            if (!Request.Headers.TryGetValue("X-Reauth-Token", out var headerValues))
                throw new AppUnauthorizedAccessException("Re-auth required");

            var token = headerValues.ToString();
            var principal = _tokenService.ValidateReauthToken(token, expectedPurpose: purpose);
            if (principal == null)
                throw new AppUnauthorizedAccessException("Re-auth required");

            var currentUserId = GetCurrentUserId().ToString();
            var tokenUserId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.Equals(currentUserId, tokenUserId, StringComparison.OrdinalIgnoreCase))
                throw new AppUnauthorizedAccessException("Re-auth token does not match current user");
        }
    }
}
