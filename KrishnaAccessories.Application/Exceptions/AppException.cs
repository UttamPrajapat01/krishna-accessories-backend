namespace KrishnaAccessories.Application.Exceptions;

public class AppException : Exception
{
    public AppException(string message) : base(message) { }
}

public class NotFoundException : AppException
{
    public NotFoundException(string name, object key) : base($"Entity '{name}' with key '{key}' was not found.") { }
    public NotFoundException(string message) : base(message) { }
}

public class ValidationException : AppException
{
    public List<string> Errors { get; }
    public ValidationException(List<string> errors) : base("One or more validation failures have occurred.")
    {
        Errors = errors;
    }
}

public class BadRequestException : AppException
{
    public BadRequestException(string message) : base(message) { }
}

public class UnauthorizedException : AppException
{
    public UnauthorizedException(string message = "Unauthorized access.") : base(message) { }
}
