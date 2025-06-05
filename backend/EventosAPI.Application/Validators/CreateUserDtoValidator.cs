using FluentValidation;
using EventosAPI.Application.DTOs;

namespace EventosAPI.Application.Validators
{
    public class CreateUserDtoValidator : AbstractValidator<CreateUserDto>
    {
        public CreateUserDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("O nome é obrigatório")
                .Length(3, 100).WithMessage("O nome deve ter entre 3 e 100 caracteres");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("O email é obrigatório")
                .EmailAddress().WithMessage("O email informado não é válido")
                .MaximumLength(150).WithMessage("O email deve ter no máximo 150 caracteres");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("A senha é obrigatória")
                .MinimumLength(6).WithMessage("A senha deve ter pelo menos 6 caracteres")
                .MaximumLength(100).WithMessage("A senha deve ter no máximo 100 caracteres")
                .Matches("[A-Z]").WithMessage("A senha deve conter pelo menos uma letra maiúscula")
                .Matches("[a-z]").WithMessage("A senha deve conter pelo menos uma letra minúscula")
                .Matches("[0-9]").WithMessage("A senha deve conter pelo menos um número")
                .Matches("[^a-zA-Z0-9]").WithMessage("A senha deve conter pelo menos um caractere especial");

            RuleFor(x => x.Role)
                .NotEmpty().WithMessage("O papel é obrigatório")
                .Must(role => role == "Admin" || role == "User" || role == "Organizer")
                .WithMessage("O papel deve ser 'Admin', 'User' ou 'Organizer'");
        }
    }
}
