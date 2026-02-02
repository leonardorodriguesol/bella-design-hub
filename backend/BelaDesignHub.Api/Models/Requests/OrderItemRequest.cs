using System.ComponentModel.DataAnnotations;

namespace BelaDesignHub.Api.Models.Requests;

public record OrderItemRequest(
    [Required][MaxLength(250)] string Description,
    [Range(1, int.MaxValue)] int Quantity,
    decimal UnitPrice
);
