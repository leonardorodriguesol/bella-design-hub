using System.ComponentModel.DataAnnotations;
using BelaDesignHub.Api.Domain.Entities;

namespace BelaDesignHub.Api.Models.Requests;

public record CreateOrderRequest(
    [Required] Guid CustomerId,
    [MinLength(1, ErrorMessage = "An order must contain at least one item.")] List<OrderItemRequest> Items,
    [MaxLength(30)] string? Code,
    DateTime? DeliveryDate
);
