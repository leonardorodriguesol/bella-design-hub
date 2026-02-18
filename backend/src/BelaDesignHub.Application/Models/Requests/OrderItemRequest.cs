using System.ComponentModel.DataAnnotations;

namespace BelaDesignHub.Application.Models.Requests;

public record class OrderItemRequest
{
    public OrderItemRequest()
    {
    }

    public OrderItemRequest(string description, int quantity, decimal unitPrice)
        : this(null, description, quantity, unitPrice)
    {
    }

    public OrderItemRequest(Guid? productId, string description, int quantity, decimal unitPrice)
    {
        ProductId = productId;
        Description = description;
        Quantity = quantity;
        UnitPrice = unitPrice;
    }

    public Guid? ProductId { get; init; }

    [Required(AllowEmptyStrings = false)]
    [MaxLength(250)]
    public string Description { get; init; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int Quantity { get; init; }

    [Range(typeof(decimal), "0", "999999999")]
    public decimal UnitPrice { get; init; }
}
