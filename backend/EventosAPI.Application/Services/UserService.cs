using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
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

        public UserService(
            IUserRepository userRepository,
            IMapper mapper,
            IConfiguration configuration,
            IPasswordHashService passwordHashService,
            ITokenService tokenService)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _configuration = configuration;
            _passwordHashService = passwordHashService;
            _tokenService = tokenService;
        }

        public async Task<UserDto> GetByIdAsync(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);
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
                throw new Exception("Email já está em uso");

            var user = _mapper.Map<User>(createUserDto);
            user.PasswordHash = _passwordHashService.HashPassword(createUserDto.Password);

            user = await _userRepository.CreateAsync(user);
            return _mapper.Map<UserDto>(user);
        }

        public async Task UpdateAsync(Guid id, UpdateUserDto updateUserDto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                throw new Exception("Usuário não encontrado");

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
                throw new Exception("Email ou senha inválidos");
            }

            if (!_passwordHashService.VerifyPassword(loginDto.Password, user.PasswordHash))
                throw new Exception("Email ou senha inválidos");

            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = await _tokenService.CreateRefreshTokenAsync(user);

            Console.WriteLine(accessToken);
            Console.WriteLine(refreshToken);

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
            // This is just a placeholder - implement actual user context retrieval
            throw new NotImplementedException("GetCurrentUserAsync needs to be implemented with actual HTTP context");
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
    }
}
