using System.ComponentModel.DataAnnotations;

namespace BelaDesignHub.Api.Models.Requests;

public record UpdateCustomerRequest(
    [Required][MaxLength(150)] string Name,
    [EmailAddress][MaxLength(150)] string? Email,
    [MaxLength(40)] string? Phone,
    [MaxLength(300)] string? Address
);
