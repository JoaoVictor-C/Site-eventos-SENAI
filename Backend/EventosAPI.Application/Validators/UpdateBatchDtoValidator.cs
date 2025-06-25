using FluentValidation;
using EventosAPI.Application.DTOs;
using EventosAPI.Domain.Enums;
using BatchType = EventosAPI.Domain.Enums.BatchType;

namespace EventosAPI.Application.Validators
{
    public class UpdateBatchDtoValidator : AbstractValidator<UpdateBatchDto>
    {
        public UpdateBatchDtoValidator()
        {
            RuleFor(x => x.Name)
                .MaximumLength(45).WithMessage("O nome do lote deve ter no máximo 45 caracteres")
                .Matches("^[a-zA-Z0-9 ]*$").WithMessage("O nome do lote deve conter apenas letras, números e espaços")
                .When(x => !string.IsNullOrEmpty(x.Name));

            RuleFor(x => x.UnitPrice)
                .GreaterThanOrEqualTo(0).WithMessage("O preço unitário não pode ser negativo")
                .PrecisionScale(10, 2, true).WithMessage("O preço deve ter no máximo 2 casas decimais")
                .When(x => x.UnitPrice.HasValue);

            RuleFor(x => x.TotalQuantity)
                .GreaterThan(0).WithMessage("A quantidade total deve ser maior que zero")
                .LessThanOrEqualTo(10000).WithMessage("A quantidade total não pode exceder 10.000")
                .When(x => x.TotalQuantity.HasValue);

            RuleFor(x => x.Type)
                .IsInEnum().WithMessage("O tipo do lote é inválido")
                .When(x => x.Type.HasValue);

            // BatchType.Quantity
            When(x => x.Type == BatchType.Quantity, () => {
                RuleFor(x => x.UnitPrice)
                    .GreaterThanOrEqualTo(0).WithMessage("O preço unitário não pode ser negativo")
                    .When(x => x.UnitPrice.HasValue);
                RuleFor(x => x.StartDate)
                    .Null().WithMessage("Lotes do tipo quantidade não devem ter data de início")
                    .When(x => x.Type.HasValue);

                RuleFor(x => x.EndDate)
                    .Null().WithMessage("Lotes do tipo quantidade não devem ter data de término")
                    .When(x => x.Type.HasValue);
            });

            // BatchType.TimeWindow
            When(x => x.Type == BatchType.TimeWindow, () => {
                RuleFor(x => x.UnitPrice)
                    .GreaterThanOrEqualTo(0).WithMessage("O preço unitário não pode ser negativo")
                    .When(x => x.UnitPrice.HasValue);
                RuleFor(x => x.StartDate)
                    .NotNull().WithMessage("A data de início é obrigatória para lotes do tipo janela de tempo")
                    .GreaterThanOrEqualTo(DateTime.UtcNow).WithMessage("A data de início deve ser no futuro")
                    .When(x => x.StartDate.HasValue);

                RuleFor(x => x.EndDate)
                    .NotNull().WithMessage("A data de término é obrigatória para lotes do tipo janela de tempo")
                    .GreaterThan(x => x.StartDate ?? DateTime.UtcNow).WithMessage("A data de término deve ser posterior à data de início")
                    .When(x => x.EndDate.HasValue && x.StartDate.HasValue)
                    .Must((dto, endDate) => {
                        if (!dto.StartDate.HasValue || !endDate.HasValue) return true;
                        var duration = endDate.Value - dto.StartDate.Value;
                        return duration.TotalHours >= 1 && duration.TotalDays <= 90;
                    }).WithMessage("A duração do lote deve ser entre 1 hora e 90 dias");
            });

            // BatchType.Free
            When(x => x.Type == BatchType.Free, () => {
                RuleFor(x => x.UnitPrice)
                    .Equal(0).WithMessage("Lotes gratuitos devem ter preço zero")
                    .When(x => x.UnitPrice.HasValue);
            });
        }
    }
}
