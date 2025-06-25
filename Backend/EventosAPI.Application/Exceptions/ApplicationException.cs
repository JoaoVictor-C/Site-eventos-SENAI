namespace EventosAPI.Application.Exceptions
{
    public class ApplicationException : Exception
    {
        public ApplicationException(string message) : base(message)
        {
        }

        public ApplicationException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }

    public class NotFoundException : ApplicationException
    {
        public NotFoundException(string name, object key) 
            : base($"Entity \"{name}\" ({key}) was not found.")
        {
        }
    }

    public class ValidationException : ApplicationException
    {
        public IDictionary<string, string[]> Errors { get; }

        public ValidationException() : base("One or more validation failures have occurred.")
        {
            Errors = new Dictionary<string, string[]>();
        }

        public ValidationException(IDictionary<string, string[]> errors) : this()
        {
            Errors = errors;
        }

        public ValidationException(IEnumerable<string> errors) : base(string.Join(Environment.NewLine, errors))
        {
            Errors = new Dictionary<string, string[]>
            {
                { "General", errors.ToArray() }
            };
        }
    }

    public class UnauthorizedAccessException : ApplicationException
    {
        public UnauthorizedAccessException(string message) : base(message)
        {
        }
    }

    public class BusinessRuleException : ApplicationException
    {
        public BusinessRuleException(string message) : base(message)
        {
        }
    }
}
