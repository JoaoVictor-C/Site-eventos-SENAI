using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace EventosAPI.API.Extensions
{
    public static class RateLimitingExtensions
    {
        public static IServiceCollection AddRateLimiting(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

                options.AddFixedWindowLimiter("fixed", config =>
                {
                    config.PermitLimit = configuration.GetValue<int>("RateLimiting:PermitLimit", 10);
                    config.Window = TimeSpan.FromSeconds(configuration.GetValue<int>("RateLimiting:WindowSeconds", 1));
                    config.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                    config.QueueLimit = configuration.GetValue<int>("RateLimiting:QueueLimit", 2);
                });

                // Add a policy for authenticated users with higher limits
                options.AddPolicy("authenticated", context =>
                {
                    return RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: context.User.Identity?.Name ?? context.Request.Headers.Host.ToString(),
                        factory: partition => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = configuration.GetValue<int>("RateLimiting:AuthenticatedPermitLimit", 30),
                            Window = TimeSpan.FromSeconds(configuration.GetValue<int>("RateLimiting:WindowSeconds", 1)),
                            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                            QueueLimit = configuration.GetValue<int>("RateLimiting:QueueLimit", 2)
                        });
                });
            });

            return services;
        }
    }
}
