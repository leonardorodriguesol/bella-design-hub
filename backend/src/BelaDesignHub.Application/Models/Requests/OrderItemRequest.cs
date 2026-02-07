using System.ComponentModel.DataAnnotations;

namespace BelaDesignHub.Application.Models.Requests;

public record OrderItemRequest(
    [Required(AllowEmptyStrings = false)][MaxLength(250)] string Description,
    [Range(1, int.MaxValue)] int Quantity,
    decimal UnitPrice
);
