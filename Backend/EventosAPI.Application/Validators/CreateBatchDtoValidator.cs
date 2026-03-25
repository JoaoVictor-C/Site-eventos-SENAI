using FluentValidation;
using EventosAPI.Application.DTOs;
using EventosAPI.Domain.Enums;
using BatchType = EventosAPI.Domain.Enums.BatchType;

namespace EventosAPI.Application.Validators
{
    public class CreateBatchDtoValidator : AbstractValidator<CreateBatchDto>
    {
        public CreateBatchDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("O nome do lote é obrigatório")
                .MaximumLength(45).WithMessage("O nome do lote deve ter no máximo 45 caracteres")
                .Matches("^[a-zA-Z0-9 ]*$").WithMessage("O nome do lote deve conter apenas letras, números e espaços");

            RuleFor(x => x.EventId)
                .NotEmpty().WithMessage("O ID do evento é obrigatório");

            RuleFor(x => x.TotalQuantity)
                .NotEmpty().WithMessage("A quantidade total é obrigatória")
                .GreaterThan(0).WithMessage("A quantidade total deve ser maior que zero")
                .LessThanOrEqualTo(10000).WithMessage("A quantidade total não pode exceder 10.000");

            RuleFor(x => x.Type)
                .IsInEnum().WithMessage("O tipo do lote é inválido")
                .NotNull().WithMessage("O tipo do lote é obrigatório");

            // BatchType.Quantity
            When(x => x.Type == BatchType.Quantity, () => {
                RuleFor(x => x.UnitPrice)
                    .GreaterThanOrEqualTo(0).WithMessage("O preço unitário não pode ser negativo");
                RuleFor(x => x.StartDate)
                    .Empty().WithMessage("Lotes do tipo quantidade não devem ter data de início");
                RuleFor(x => x.EndDate)
                    .Empty().WithMessage("Lotes do tipo quantidade não devem ter data de término");
            });

            // BatchType.TimeWindow
            When(x => x.Type == BatchType.TimeWindow, () => {
                RuleFor(x => x.UnitPrice)
                    .GreaterThanOrEqualTo(0).WithMessage("O preço unitário não pode ser negativo");
                RuleFor(x => x.StartDate)
                    .NotEmpty().WithMessage("A data de início é obrigatória para lotes do tipo janela de tempo")
                    .GreaterThanOrEqualTo(DateTime.UtcNow).WithMessage("A data de início deve ser no futuro");
                RuleFor(x => x.EndDate)
                    .NotEmpty().WithMessage("A data de término é obrigatória para lotes do tipo janela de tempo")
                    .GreaterThan(x => x.StartDate).WithMessage("A data de término deve ser posterior à data de início")
                    .Must((dto, endDate) => {
                        var duration = endDate - dto.StartDate;
                        return duration.TotalHours >= 1 && duration.TotalDays <= 90;
                    }).WithMessage("A duração do lote deve ser entre 1 hora e 90 dias");
            });

            // BatchType.Free
            When(x => x.Type == BatchType.Free, () => {
                RuleFor(x => x.UnitPrice)
                    .Equal(0).WithMessage("Lotes gratuitos devem ter preço zero");
            });
        }
    }
}