using System.Net;
using System.Text.Json;
using KrishnaAccessories.Application.Common;
using KrishnaAccessories.Application.Exceptions;

namespace KrishnaAccessories.API.Middlewares;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = exception switch
        {
            ValidationException valEx => new
            {
                StatusCode = HttpStatusCode.BadRequest,
                Body = ApiResponse<object>.ErrorResult(valEx.Message, valEx.Errors)
            },
            BadRequestException badEx => new
            {
                StatusCode = HttpStatusCode.BadRequest,
                Body = ApiResponse<object>.ErrorResult(badEx.Message)
            },
            NotFoundException notFoundEx => new
            {
                StatusCode = HttpStatusCode.NotFound,
                Body = ApiResponse<object>.ErrorResult(notFoundEx.Message)
            },
            UnauthorizedException unauthEx => new
            {
                StatusCode = HttpStatusCode.Unauthorized,
                Body = ApiResponse<object>.ErrorResult(unauthEx.Message)
            },
            _ => new
            {
                StatusCode = HttpStatusCode.InternalServerError,
                Body = ApiResponse<object>.ErrorResult($"Error: {exception.Message} | Inner: {exception.InnerException?.Message}")
            }
        };

        context.Response.StatusCode = (int)response.StatusCode;
        var json = JsonSerializer.Serialize(response.Body, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        await context.Response.WriteAsync(json);
    }
}
