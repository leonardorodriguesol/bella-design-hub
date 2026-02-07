using System.ComponentModel.DataAnnotations;

namespace BelaDesignHub.Application.Models.Requests;

public record class CreateOrderRequest
{
    public CreateOrderRequest()
    {
    }

    public CreateOrderRequest(Guid customerId, List<OrderItemRequest> items, string? code, DateTime? deliveryDate)
    {
        CustomerId = customerId;
        Items = items;
        Code = code;
        DeliveryDate = deliveryDate;
    }

    [Required]
    public Guid CustomerId { get; init; }

    [MinLength(1, ErrorMessage = "An order must contain at least one item.")]
    public List<OrderItemRequest> Items { get; init; } = new();

    [MaxLength(30)]
    public string? Code { get; init; }

    public DateTime? DeliveryDate { get; init; }
}
