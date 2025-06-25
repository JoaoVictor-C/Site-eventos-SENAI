using FluentValidation;
using EventosAPI.Application.DTOs;
using EventosAPI.Domain.Enums;

namespace EventosAPI.Application.Validators
{
    public class TicketPurchaseDtoValidator : AbstractValidator<TicketPurchaseDto>
    {
        public TicketPurchaseDtoValidator()
        {
            RuleFor(x => x.BatchId)
                .NotEmpty().WithMessage("Batch ID is required");

            RuleFor(x => x.Quantity)
                .GreaterThan(0).WithMessage("Quantity must be greater than zero")
                .LessThanOrEqualTo(10).WithMessage("Maximum of 10 tickets per purchase")
                .When(x => x.Type != TicketType.Staff);

            RuleFor(x => x.Type)
                .IsInEnum().WithMessage("Please select a valid ticket type")
                .NotEqual(TicketType.Staff)
                .Unless(x => x.PaymentMethod == PaymentMethod.Free)
                .WithMessage("Staff tickets must be free");

            RuleFor(x => x.PaymentMethod)
                .IsInEnum().WithMessage("Please select a valid payment method")
                .NotEqual(PaymentMethod.Free)
                .Unless(x => x.Type == TicketType.Staff)
                .WithMessage("Free payment method is only available for staff tickets");

            RuleFor(x => x.PromoCode)
                .Length(3, 20)
                .When(x => !string.IsNullOrEmpty(x.PromoCode))
                .WithMessage("Promo code must be between 3 and 20 characters")
                .Must(code => code == null || !code.Contains(" "))
                .WithMessage("Promo code cannot contain spaces");

            RuleFor(x => x.AcceptTerms)
                .Equal(true).WithMessage("You must accept the terms and conditions");

            // Cross-field validation
            RuleFor(x => x)
                .Must(x => !(x.Type == TicketType.Staff && x.Quantity > 2))
                .WithMessage("Staff members can only purchase up to 2 tickets")
                .Must(x => x.Type != TicketType.Student || x.PaymentMethod != PaymentMethod.Cash)
                .WithMessage("Student tickets cannot be paid in cash");
        }
    }
}
