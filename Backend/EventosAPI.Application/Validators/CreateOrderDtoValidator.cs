using FluentValidation;
using EventosAPI.Application.DTOs;
using EventosAPI.Domain.Enums;

namespace EventosAPI.Application.Validators
{
    public class CreateOrderDtoValidator : AbstractValidator<CreateOrderDto>
    {
        public CreateOrderDtoValidator()
        {
            RuleFor(x => x.BatchId)
                .NotEmpty().WithMessage("O ID do lote é obrigatório");

            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("O ID do usuário é obrigatório");

            RuleFor(x => x.Quantity)
                .NotEmpty().WithMessage("A quantidade é obrigatória")
                .GreaterThan(0).WithMessage("A quantidade deve ser maior que zero")
                .LessThanOrEqualTo(10).WithMessage("O máximo de ingressos por pedido é 10");

            RuleFor(x => x.PaymentMethod)
                .IsInEnum().WithMessage("O método de pagamento é inválido")
                .NotNull().WithMessage("O método de pagamento é obrigatório");

            // Validate each ticket request in the order
            RuleForEach(x => x.TicketRequests).SetValidator(new TicketRequestValidator());

            // Validate that the quantity matches the number of ticket requests
            RuleFor(x => x)
                .Must(x => x.Quantity == x.TicketRequests.Count)
                .WithMessage("A quantidade de ingressos deve corresponder ao número de solicitações de ingressos");
        }
    }

    public class TicketRequestValidator : AbstractValidator<TicketRequestDto>
    {
        public TicketRequestValidator()
        {
            RuleFor(x => x.Type)
                .IsInEnum().WithMessage("O tipo do ingresso é inválido")
                .NotNull().WithMessage("O tipo do ingresso é obrigatório");

            RuleFor(x => x.DocumentNumber)
                .NotEmpty().WithMessage("O número do documento é obrigatório")
                .When(x => x.Type == TicketType.Student)
                .Must(BeValidDocumentNumber).WithMessage("O número do documento contém caracteres inválidos")
                .When(x => !string.IsNullOrEmpty(x.DocumentNumber));
        }

        private bool BeValidDocumentNumber(string? documentNumber)
        {
            if (string.IsNullOrEmpty(documentNumber)) return true;

            // Only allow numbers and basic special characters
            return System.Text.RegularExpressions.Regex.IsMatch(documentNumber, @"^[a-zA-Z0-9\-\.]+$");
        }
    }
}