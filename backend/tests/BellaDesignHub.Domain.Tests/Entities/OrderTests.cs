using BellaDesignHub.Domain.Entities;

namespace BellaDesignHub.Domain.Tests.Entities;

public class OrderTests
{
    [Fact]
    public void NewOrder_ShouldStartInPendingStatusWithInitializedCollection()
    {
        var order = new Order();

        Assert.Equal(OrderStatus.Pending, order.Status);
        Assert.NotNull(order.Items);
        Assert.Empty(order.Items);
    }

    [Fact]
    public void NewOrder_ShouldSetCreatedAtInUtcNowWindow()
    {
        var before = DateTime.UtcNow.AddSeconds(-1);

        var order = new Order();

        var after = DateTime.UtcNow.AddSeconds(1);
        Assert.InRange(order.CreatedAt, before, after);
    }
}
