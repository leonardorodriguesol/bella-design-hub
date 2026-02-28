using BellaDesignHub.Domain.Entities;

namespace BellaDesignHub.Domain.Tests.Entities;

public class OrderItemTests
{
    [Fact]
    public void Total_ShouldMultiplyQuantityByUnitPrice()
    {
        var item = new OrderItem
        {
            Quantity = 3,
            UnitPrice = 149.90m
        };

        var total = item.Total;

        Assert.Equal(449.70m, total);
    }

    [Fact]
    public void Total_ShouldReturnZero_WhenQuantityIsZero()
    {
        var item = new OrderItem
        {
            Quantity = 0,
            UnitPrice = 250m
        };

        var total = item.Total;

        Assert.Equal(0m, total);
    }
}
