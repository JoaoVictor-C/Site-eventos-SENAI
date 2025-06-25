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
            
            // Enable HSTS - force HTTPS
            headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
            
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

            // Only add HSTS header on HTTPS
            if (context.Request.IsHttps)
            {
                headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
            }

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
