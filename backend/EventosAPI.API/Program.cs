using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using EventosAPI.Infrastructure.Data;
using EventosAPI.Infrastructure.Repositories;
using EventosAPI.Domain.Interfaces.Repositories;
using EventosAPI.Application.Interfaces;
using EventosAPI.Application.Services;
using EventosAPI.Application.Mappings;
using Serilog;
using EventosAPI.API.Extensions;
using EventosAPI.API.Middleware;
using EventosAPI.Domain.Interfaces.Services;
using EventosAPI.Infrastructure.Security;
using FluentValidation;
using FluentValidation.AspNetCore;
using EventosAPI.Application.Validators;

var builder = WebApplication.CreateBuilder(args);

// Configurar Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation()
    .AddFluentValidationClientsideAdapters()
    .AddValidatorsFromAssemblyContaining<CreateUserDtoValidator>();

// Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerDocumentation();

// Configure Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var serverVersion = new MySqlServerVersion(new Version(8, 0, 0));
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, serverVersion, 
        mysqlOptions => mysqlOptions.EnableRetryOnFailure(
            maxRetryCount: 10,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null)));

// Configure AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// Configure Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IEventRepository, EventRepository>();

// Configure Services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<DatabaseSeeder>();
builder.Services.AddScoped<IPasswordHashService, BCryptPasswordHashService>();
builder.Services.AddScoped<ITokenService, TokenService>();

// Validate JWT Configuration
var jwtKey = builder.Configuration["Jwt:Key"] ?? 
    throw new ArgumentNullException("Jwt:Key", "JWT Key configuration is missing");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? 
    throw new ArgumentNullException("Jwt:Issuer", "JWT Issuer configuration is missing");
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? 
    throw new ArgumentNullException("Jwt:Audience", "JWT Audience configuration is missing");

// Configure JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

try
{
    Log.Information("Iniciando a aplicação...");

    // Aplicar migrações e seed do banco de dados
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var databaseSeeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
        
        await dbContext.Database.MigrateAsync();
        await databaseSeeder.SeedAsync();
    }

    app.UseHttpsRedirection();
    
    app.UseErrorHandling(); // Middleware de tratamento de erros
    
    app.UseCors("AllowAll");
    
    app.UseAuthentication();
    app.UseAuthorization();
    
    app.MapControllers();
    
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "A aplicação terminou inesperadamente");
}
finally
{
    Log.CloseAndFlush();
}
