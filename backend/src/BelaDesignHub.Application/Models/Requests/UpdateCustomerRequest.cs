using System.ComponentModel.DataAnnotations;

namespace BelaDesignHub.Application.Models.Requests;

public record class UpdateCustomerRequest
{
    public UpdateCustomerRequest()
    {
    }

    public UpdateCustomerRequest(string name, string? email, string? phone, string? address)
    {
        Name = name;
        Email = email;
        Phone = phone;
        Address = address;
    }

    [Required(AllowEmptyStrings = false)]
    [MaxLength(150)]
    public string Name { get; init; } = string.Empty;

    [EmailAddress]
    [MaxLength(150)]
    public string? Email { get; init; }

    [MaxLength(40)]
    public string? Phone { get; init; }

    [MaxLength(300)]
    public string? Address { get; init; }
}
