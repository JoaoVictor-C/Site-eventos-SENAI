using FluentValidation;
using EventosAPI.Application.DTOs;
using EventosAPI.Domain.Enums;

namespace EventosAPI.Application.Validators
{
    public class CreateEventDtoValidator : AbstractValidator<CreateEventDto>
    {
        public CreateEventDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Event name is required")
                .Length(3, 200).WithMessage("Event name must be between 3 and 200 characters");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Event description is required")
                .Length(10, 2000).WithMessage("Event description must be between 10 and 2000 characters");

            RuleFor(x => x.EventDate)
                .NotEmpty().WithMessage("Event start date is required")
                .Must(date => date > DateTime.UtcNow)
                    .WithMessage("Event must start in the future")
                .Must(date => date <= DateTime.UtcNow.AddYears(2))
                    .WithMessage("Event cannot be scheduled more than 2 years in advance");

            RuleFor(x => x.EndDate)
                .NotEmpty().WithMessage("Event end date is required")
                .Must((model, endDate) => endDate > model.EventDate)
                    .WithMessage("Event end date must be after start date")
                .Must((model, endDate) => endDate <= model.EventDate.AddDays(30))
                    .WithMessage("Event cannot be longer than 30 days");

            RuleFor(x => x.MaxParticipants)
                .NotEmpty().WithMessage("Maximum number of participants is required")
                .GreaterThan(0).WithMessage("Maximum participants must be greater than zero")
                .LessThanOrEqualTo(100000).WithMessage("Maximum participants cannot exceed 100,000");

            RuleFor(x => x.Location)
                .NotEmpty().WithMessage("Event location is required")
                .Length(3, 200).WithMessage("Location must be between 3 and 200 characters");

            RuleFor(x => x.ImageUrl)
                .Must(BeAValidUrl).When(x => !string.IsNullOrEmpty(x.ImageUrl))
                .WithMessage("Please provide a valid image URL");

            RuleFor(x => x.Category)
                .IsInEnum().WithMessage("Please select a valid event category")
                .NotEqual(EventCategory.Other)
                .When(x => x.MaxParticipants > 1000)
                .WithMessage("Large events (>1000 participants) must have a specific category");
        }

        private bool BeAValidUrl(string? url)
        {
            if (string.IsNullOrEmpty(url))
                return true;

            return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
                && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
        }
    }
}
