using FluentValidation;
using EventosAPI.Application.DTOs;

namespace EventosAPI.Application.Validators
{
    public class AssignEventRoleValidator : AbstractValidator<AssignEventRoleDto>
    {
        public AssignEventRoleValidator()
        {
            RuleFor(x => x.EventId)
                .NotEmpty().WithMessage("EventId is required");

            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("UserId is required");

            RuleFor(x => x.RoleType)
                .IsInEnum().WithMessage("Invalid role type");
        }
    }
}
