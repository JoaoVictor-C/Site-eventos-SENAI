using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
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

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

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
{
    options.UseMySql(connectionString, serverVersion, mysqlOptions =>
    {
        mysqlOptions.EnableRetryOnFailure(
            maxRetryCount: 10,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null);
    });
    
    // Enable sensitive data logging only in Development
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
    }
});

// Configure AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// Configure HTTP Context Accessor
builder.Services.AddHttpContextAccessor();

// Configure Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IEventRepository, EventRepository>();
builder.Services.AddScoped<IEventRoleRepository, EventRoleRepository>();
builder.Services.AddScoped<IBatchRepository, BatchRepository>();
builder.Services.AddScoped<ITicketRepository, TicketRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
// Configure Services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<IEventRoleService, EventRoleService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<DatabaseSeeder>();
builder.Services.AddScoped<IPasswordHashService, BCryptPasswordHashService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IBatchService, BatchService>();

// Validate JWT Configuration
var jwtKey = builder.Configuration["Jwt:Key"] ?? 
    throw new ArgumentNullException("Jwt:Key", "JWT Key configuration is missing");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? 
    throw new ArgumentNullException("Jwt:Issuer", "JWT Issuer configuration is missing");
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? 
    throw new ArgumentNullException("Jwt:Audience", "JWT Audience configuration is missing");

// Configure JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
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
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero // Removes the default 5 minute clock skew
    };

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
            {
                context.Response.Headers.Append("Token-Expired", "true");
            }
            return Task.CompletedTask;
        }
    };
});


// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Frontend URL
              .AllowAnyMethod()
              .AllowAnyHeader()
              .WithExposedHeaders("Token-Expired")
              .AllowCredentials();
    });
});

// Configure Rate Limiting
builder.Services.AddRateLimiting(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseSecurityHeaders();
app.UseErrorHandling();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Apply rate limiting
app.UseRateLimiter();
app.MapControllers().RequireRateLimiting("fixed");

// Initialize database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var seeder = services.GetRequiredService<DatabaseSeeder>();
        await context.Database.MigrateAsync();
        await seeder.SeedAsync();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while initializing the database.");
        throw;
    }
}

app.Run();
