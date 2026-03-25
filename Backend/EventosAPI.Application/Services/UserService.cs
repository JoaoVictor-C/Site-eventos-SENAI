using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using AutoMapper;
using EventosAPI.Application.DTOs;
using EventosAPI.Application.Interfaces;
using EventosAPI.Domain.Entities;
using EventosAPI.Domain.Interfaces.Repositories;
using EventosAPI.Domain.Interfaces.Services;

namespace EventosAPI.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly IPasswordHashService _passwordHashService;
        private readonly ITokenService _tokenService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserService(
            IUserRepository userRepository, 
            IMapper mapper, 
            IConfiguration configuration,
            IPasswordHashService passwordHashService,
            ITokenService tokenService,
            IHttpContextAccessor httpContextAccessor)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _configuration = configuration;
            _passwordHashService = passwordHashService;
            _tokenService = tokenService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<UserDto> GetByIdAsync(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                throw new EventosAPI.Application.Exceptions.NotFoundException(nameof(User), id);
            return _mapper.Map<UserDto>(user);
        }

        public async Task<IEnumerable<UserDto>> GetAllAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<UserDto>>(users);
        }

        public async Task<UserDto> CreateAsync(CreateUserDto createUserDto)
        {
            if (await _userRepository.EmailExistsAsync(createUserDto.Email))
                throw new EventosAPI.Application.Exceptions.ValidationException(new[] { "Email já está em uso" });

            var user = _mapper.Map<User>(createUserDto);
            user.PasswordHash = _passwordHashService.HashPassword(createUserDto.Password);

            user = await _userRepository.CreateAsync(user);
            return _mapper.Map<UserDto>(user);
        }

        public async Task UpdateAsync(Guid id, UpdateUserDto updateUserDto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                throw new EventosAPI.Application.Exceptions.NotFoundException(nameof(User), id);

            _mapper.Map(updateUserDto, user);
            await _userRepository.UpdateAsync(user);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _userRepository.DeleteAsync(id);
        }

        public async Task<TokenResponseDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _userRepository.GetByEmailAsync(loginDto.Email);
            if (user == null)
            {
                // Still verify a password to maintain constant time
                _passwordHashService.VerifyPassword(loginDto.Password, _passwordHashService.HashPassword("dummy"));
                throw new EventosAPI.Application.Exceptions.ValidationException(new[] { "Email ou senha inválidos" });
            }

            if (!_passwordHashService.VerifyPassword(loginDto.Password, user.PasswordHash))
                throw new EventosAPI.Application.Exceptions.ValidationException(new[] { "Email ou senha inválidos" });

            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = await _tokenService.CreateRefreshTokenAsync(user);

            return new TokenResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                AccessTokenExpiration = _tokenService.GetAccessTokenExpiration(),
                User = _mapper.Map<UserDto>(user)
            };
        }

        public Task<UserDto> GetCurrentUserAsync()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                throw new System.UnauthorizedAccessException("User is not authenticated");

            return GetByIdAsync(userId);
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? 
                throw new ArgumentNullException("Jwt:Key", "JWT Key configuration is missing");
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? 
                throw new ArgumentNullException("Jwt:Issuer", "JWT Issuer configuration is missing");
            var jwtAudience = _configuration["Jwt:Audience"] ?? 
                throw new ArgumentNullException("Jwt:Audience", "JWT Audience configuration is missing");
            var jwtExpiresInHours = _configuration["Jwt:ExpiresInHours"] ?? "24"; // Default to 24 hours

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(Convert.ToDouble(jwtExpiresInHours)),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task ResetUserPasswordAsync(Guid userId)
        {
            await Task.Run(() => throw new NotImplementedException("ResetUserPasswordAsync needs to be implemented"));
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
                throw new EventosAPI.Application.Exceptions.NotFoundException(nameof(User), email);
            return user;
        }

        public async Task SetTwoFactorSecretAsync(Guid userId, string secret)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new EventosAPI.Application.Exceptions.NotFoundException(nameof(User), userId);
            user.TwoFactorSecret = secret;
            await _userRepository.UpdateAsync(user);
        }
    }
}
