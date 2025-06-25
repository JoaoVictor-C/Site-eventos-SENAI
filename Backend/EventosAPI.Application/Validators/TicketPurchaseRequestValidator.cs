using FluentValidation;
using EventosAPI.Application.DTOs;
using EventosAPI.Domain.Enums;

namespace EventosAPI.Application.Validators
{
    public class TicketPurchaseRequestValidator : AbstractValidator<TicketPurchaseRequestDto>
    {
        public TicketPurchaseRequestValidator()
        {
            RuleFor(x => x.BatchId)
                .NotEmpty()
                .WithMessage("O ID do lote é obrigatório");

            RuleFor(x => x.Quantity)
                .GreaterThan(0)
                .WithMessage("A quantidade deve ser maior que zero")
                .LessThanOrEqualTo(10)
                .WithMessage("O máximo de ingressos por compra é 10");

            RuleFor(x => x.Type)
                .IsInEnum()
                .WithMessage("O tipo do ingresso é inválido")
                .NotNull()
                .WithMessage("O tipo do ingresso é obrigatório");

            When(x => x.Type == TicketType.Student, () =>
            {
                RuleFor(x => x.DocumentNumber)
                    .NotEmpty()
                    .WithMessage("O número do documento estudantil é obrigatório")
                    .Matches(@"^[a-zA-Z0-9\-\.]+$")
                    .WithMessage("O número do documento contém caracteres inválidos");
            });
        }
    }
}
