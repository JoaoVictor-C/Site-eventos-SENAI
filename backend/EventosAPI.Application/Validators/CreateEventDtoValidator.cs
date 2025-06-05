using FluentValidation;
using EventosAPI.Application.DTOs;

namespace EventosAPI.Application.Validators
{
    public class CreateEventDtoValidator : AbstractValidator<CreateEventDto>
    {
        public CreateEventDtoValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("O título é obrigatório")
                .Length(3, 200).WithMessage("O título deve ter entre 3 e 200 caracteres");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("A descrição é obrigatória")
                .Length(10, 2000).WithMessage("A descrição deve ter entre 10 e 2000 caracteres");

            RuleFor(x => x.StartDate)
                .NotEmpty().WithMessage("A data de início é obrigatória")
                .Must(date => date > DateTime.Now).WithMessage("A data de início deve ser maior que a data atual");

            RuleFor(x => x.EndDate)
                .NotEmpty().WithMessage("A data de término é obrigatória")
                .Must((model, endDate) => endDate > model.StartDate)
                .WithMessage("A data de término deve ser maior que a data de início");

            RuleFor(x => x.MaxParticipants)
                .NotEmpty().WithMessage("O número máximo de participantes é obrigatório")
                .GreaterThan(0).WithMessage("O número máximo de participantes deve ser maior que zero");

            RuleFor(x => x.Location)
                .NotEmpty().WithMessage("O local é obrigatório")
                .Length(3, 200).WithMessage("O local deve ter entre 3 e 200 caracteres");
        }
    }
}
