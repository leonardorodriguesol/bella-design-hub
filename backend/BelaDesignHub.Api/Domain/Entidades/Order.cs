namespace BelaDesignHub.Api.Domain.Entities;

public enum OrderStatus
{
    Pending = 0,
    InProduction = 1,
    Shipped = 2,
    Delivered = 3,
    Cancelled = 4
}

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeliveryDate { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
