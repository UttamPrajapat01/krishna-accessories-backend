using FluentValidation;
using KrishnaAccessories.Application.DTOs.Address;

namespace KrishnaAccessories.Application.Validators;

public class CreateAddressDtoValidator : AbstractValidator<CreateAddressDto>
{
    public CreateAddressDtoValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().WithMessage("Full name is required.");
        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone number is required.")
            .Must(p => !string.IsNullOrWhiteSpace(p) && System.Text.RegularExpressions.Regex.Replace(p, @"\D", "").Length >= 10)
            .WithMessage("Please enter a valid 10-digit phone number.");
        RuleFor(x => x.AddressLine1).NotEmpty().WithMessage("Street address is required.");
        RuleFor(x => x.City).NotEmpty().WithMessage("City is required.");
        RuleFor(x => x.State).NotEmpty().WithMessage("State is required.");
        RuleFor(x => x.PostalCode).NotEmpty().WithMessage("Postal code is required.");
    }
}
