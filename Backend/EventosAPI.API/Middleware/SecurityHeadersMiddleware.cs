using Microsoft.AspNetCore.Http;

namespace EventosAPI.API.Middleware
{
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;

        public SecurityHeadersMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var headers = context.Response.Headers;

            // Prevent XSS attacks
            headers["X-XSS-Protection"] = "1; mode=block";
            
            // Prevent MIME type sniffing
            headers["X-Content-Type-Options"] = "nosniff";
            
            // Control iframe embedding
            headers["X-Frame-Options"] = "DENY";

            // Control browser features
            headers["Permissions-Policy"] = "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()";
            
            // Restrict content sources
            headers["Content-Security-Policy"] = 
                "default-src 'self'; " +
                "script-src 'self'; " +
                "style-src 'self'; " +
                "img-src 'self' data:; " +
                "font-src 'self'; " +
                "frame-ancestors 'self'";

            // Referrer policy
            headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

            await _next(context);
        }
    }

    public static class SecurityHeadersMiddlewareExtensions
    {
        public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
        {
            return app.UseMiddleware<SecurityHeadersMiddleware>();
        }
    }
}
