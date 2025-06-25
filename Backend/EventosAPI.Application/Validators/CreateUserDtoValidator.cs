using FluentValidation;
using EventosAPI.Application.DTOs;
using System.Text.RegularExpressions;

namespace EventosAPI.Application.Validators
{
    public class CreateUserDtoValidator : AbstractValidator<CreateUserDto>
    {
        public CreateUserDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("O nome é obrigatório")
                .Length(3, 100).WithMessage("O nome deve ter entre 3 e 100 caracteres")
                .Matches(@"^[a-zA-ZÀ-ÿ0-9 ]*$").WithMessage("O nome deve conter apenas letras, números e espaços")
                .Must(BeValidName).WithMessage("O nome não deve conter caracteres especiais");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("O email é obrigatório")
                .EmailAddress().WithMessage("O email informado não é válido")
                .MaximumLength(150).WithMessage("O email deve ter no máximo 150 caracteres");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("A senha é obrigatória")
                .MinimumLength(8).WithMessage("A senha deve ter pelo menos 8 caracteres")
                .MaximumLength(100).WithMessage("A senha deve ter no máximo 100 caracteres")
                .Matches("[A-Z]").WithMessage("A senha deve conter pelo menos uma letra maiúscula")
                .Matches("[a-z]").WithMessage("A senha deve conter pelo menos uma letra minúscula")
                .Matches("[0-9]").WithMessage("A senha deve conter pelo menos um número")
                .Matches("[^a-zA-Z0-9]").WithMessage("A senha deve conter pelo menos um caractere especial");
               

            RuleFor(x => x.Phone)
                .Matches(@"^\+?[\d\s-()]+$").WithMessage("O telefone deve conter apenas números, espaços, hífens e parênteses")
                .MaximumLength(20).WithMessage("O telefone deve ter no máximo 20 caracteres")
                .When(x => !string.IsNullOrEmpty(x.Phone));
        }

        private bool BeValidName(string name)
        {
            if (string.IsNullOrEmpty(name)) return false;
            
            // Check for common SQL injection patterns
            var sqlInjectionPattern = @"(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT( +INTO)?|MERGE|SELECT|UPDATE|UNION( +ALL)?)\b)";
            if (Regex.IsMatch(name, sqlInjectionPattern, RegexOptions.IgnoreCase))
                return false;

            // Check for XSS patterns
            var xssPattern = @"[<>()\/\\\[\]]";
            if (Regex.IsMatch(name, xssPattern))
                return false;

            return true;
        }

        private bool BeValidPassword(string password)
        {
            if (string.IsNullOrEmpty(password)) return false;

            // Check for common weak password patterns
            var commonPasswords = new[] { "password", "123456", "qwerty", "admin" };
            if (commonPasswords.Any(p => password.ToLower().Contains(p)))
                return false;

            // Check for repeated characters
            if (Regex.IsMatch(password, @"(.)\1{2,}"))
                return false;

            // Check for keyboard patterns
            var keyboardPatterns = new[] { "qwerty", "asdfgh", "zxcvbn" };
            if (keyboardPatterns.Any(p => password.ToLower().Contains(p)))
                return false;

            return true;
        }
    }
}
