using FluentValidation;
using EventosAPI.Application.DTOs;
using EventosAPI.Domain.Enums;

namespace EventosAPI.Application.Validators
{
    public class CreateTicketDtoValidator : AbstractValidator<CreateTicketDto>
    {
        public CreateTicketDtoValidator()
        {
            RuleFor(x => x.BatchId)
                .NotEmpty().WithMessage("O ID do lote é obrigatório");

            RuleFor(x => x.OrderId)
                .NotEmpty().WithMessage("O ID do pedido é obrigatório");

            RuleFor(x => x.Type)
                .IsInEnum().WithMessage("O tipo do ingresso é inválido")
                .NotNull().WithMessage("O tipo do ingresso é obrigatório");

            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("O ID do usuário é obrigatório");

            // Additional validation based on ticket type
            When(x => x.Type == TicketType.Student, () =>
            {
                RuleFor(x => x.DocumentNumber)
                    .NotEmpty().WithMessage("O número do documento estudantil é obrigatório")
                    .Matches(@"^\d{8,15}$").WithMessage("O número do documento estudantil é inválido");
            });

            // Prevent SQL injection in document numbers
            RuleFor(x => x.DocumentNumber)
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