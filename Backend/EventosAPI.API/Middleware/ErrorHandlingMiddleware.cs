using System.Net;
using System.Text.Json;
using ApplicationException = EventosAPI.Application.Exceptions.ApplicationException;
using ValidationException = EventosAPI.Application.Exceptions.ValidationException;
using NotFoundException = EventosAPI.Application.Exceptions.NotFoundException;
using BusinessRuleException = EventosAPI.Application.Exceptions.BusinessRuleException;
using AppUnauthorizedAccessException = EventosAPI.Application.Exceptions.UnauthorizedAccessException;

namespace EventosAPI.API.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;
        private readonly IHostEnvironment _environment;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger, IHostEnvironment environment)
        {
            _next = next;
            _logger = logger;
            _environment = environment;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            _logger.LogError(exception, "An error occurred while processing the request");

            var response = context.Response;
            response.ContentType = "application/json";

            object errorResponse;
            
            switch (exception)
            {
                case ValidationException validationEx:
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    errorResponse = new
                    {
                        success = false,
                        message = "Validation failed",
                        errors = validationEx.Errors
                    };
                    break;

                case NotFoundException notFoundEx:
                    response.StatusCode = (int)HttpStatusCode.NotFound;
                    errorResponse = new
                    {
                        success = false,
                        message = notFoundEx.Message
                    };
                    break;

                case UnauthorizedAccessException:
                    response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    errorResponse = new
                    {
                        success = false,
                        message = "Unauthorized access"
                    };
                    break;

                case AppUnauthorizedAccessException appUnauthorizedEx:
                    response.StatusCode = (int)HttpStatusCode.Forbidden;
                    errorResponse = new
                    {
                        success = false,
                        message = appUnauthorizedEx.Message
                    };
                    break;

                case BusinessRuleException businessEx:
                    response.StatusCode = (int)HttpStatusCode.Conflict;
                    errorResponse = new
                    {
                        success = false,
                        message = businessEx.Message
                    };
                    break;

                case ApplicationException appEx:
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    errorResponse = new
                    {
                        success = false,
                        message = appEx.Message
                    };
                    break;

                default:
                    response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    errorResponse = new
                    {
                        success = false,
                        message = _environment.IsDevelopment() ? exception.Message : "An internal error occurred",
                        details = _environment.IsDevelopment() ? new
                        {
                            exception = exception.GetType().Name,
                            stackTrace = exception.StackTrace
                        } : null
                    };
                    break;
            }

            await response.WriteAsync(JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            }));
        }
    }

    public static class ErrorHandlingMiddlewareExtensions
    {
        public static IApplicationBuilder UseErrorHandling(this IApplicationBuilder app)
        {
            return app.UseMiddleware<ErrorHandlingMiddleware>();
        }
    }
}
