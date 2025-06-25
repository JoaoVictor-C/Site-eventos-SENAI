using FluentValidation;
using EventosAPI.Application.DTOs;
using System.Text.RegularExpressions;

namespace EventosAPI.Application.Validators
{
    public class UpdateEventDtoValidator : AbstractValidator<UpdateEventDto>
    {
        public UpdateEventDtoValidator()
        {
            RuleFor(x => x.Name)
                .MaximumLength(100).WithMessage("O nome deve ter no máximo 100 caracteres")
                .Matches(@"^[\p{L}0-9 ]*$").WithMessage("O nome deve conter apenas letras, números e espaços")
                .Must(BeValidName).WithMessage("O nome não deve conter caracteres especiais")
                .When(x => !string.IsNullOrEmpty(x.Name));

            RuleFor(x => x.Description)
                .MaximumLength(255).WithMessage("A descrição deve ter no máximo 255 caracteres")
                .Must(BeValidDescription).WithMessage("A descrição contém caracteres inválidos")
                .When(x => !string.IsNullOrEmpty(x.Description));

            RuleFor(x => x.Location)
                .MaximumLength(100).WithMessage("A localização deve ter no máximo 100 caracteres")
                .Matches(@"^[\p{L}0-9\s,.-]*$").WithMessage("A localização contém caracteres inválidos")
                .When(x => !string.IsNullOrEmpty(x.Location));

            RuleFor(x => x.MaxParticipants)
                .GreaterThan(0).WithMessage("O número máximo de participantes deve ser maior que zero")
                .LessThanOrEqualTo(10000).WithMessage("O número máximo de participantes não pode exceder 10.000")
                .When(x => x.MaxParticipants.HasValue);

            RuleFor(x => x.EventDate)
                .GreaterThan(DateTime.UtcNow).WithMessage("A data do evento deve ser no futuro")
                .When(x => x.EventDate.HasValue);

            RuleFor(x => x.EndDate)
                .GreaterThan(x => x.EventDate ?? DateTime.UtcNow).WithMessage("A data de término deve ser posterior à data do evento")
                .When(x => x.EndDate.HasValue && x.EventDate.HasValue);

            RuleFor(x => x.ImageUrl)
                .Must(BeValidUrl).WithMessage("A URL da imagem é inválida")
                .When(x => !string.IsNullOrEmpty(x.ImageUrl));
        }

        private bool BeValidName(string name)
        {
            if (string.IsNullOrEmpty(name)) return true;
            
            var sqlInjectionPattern = @"(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT( +INTO)?|MERGE|SELECT|UPDATE|UNION( +ALL)?)\b)";
            if (Regex.IsMatch(name, sqlInjectionPattern, RegexOptions.IgnoreCase))
                return false;

            var xssPattern = @"[<>()\/\\\[\]]";
            if (Regex.IsMatch(name, xssPattern))
                return false;

            return true;
        }

        private bool BeValidDescription(string description)
        {
            if (string.IsNullOrEmpty(description)) return true;

            var dangerousPattern = @"<[^>]*>|javascript:|data:|vbscript:";
            return !Regex.IsMatch(description, dangerousPattern, RegexOptions.IgnoreCase);
        }

        private bool BeValidUrl(string? url)
        {
            if (string.IsNullOrEmpty(url)) return true;

            return Uri.TryCreate(url, UriKind.Absolute, out Uri? uriResult)
                && (uriResult.Scheme == Uri.UriSchemeHttps);
        }
    }
}