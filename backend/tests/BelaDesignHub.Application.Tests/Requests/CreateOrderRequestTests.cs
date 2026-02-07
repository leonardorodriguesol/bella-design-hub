using BelaDesignHub.Application.Tests.TestHelpers;
using BelaDesignHub.Application.Models.Requests;

namespace BelaDesignHub.Application.Tests.Requests;

public class CreateOrderRequestTests
{
    [Fact]
    public void ValidRequest_ShouldBeValid()
    {
        var request = new CreateOrderRequest(
            Guid.NewGuid(),
            new List<OrderItemRequest>
            {
                new("Item", 1, 100m)
            },
            null,
            DateTime.UtcNow);

        var isValid = ValidationHelper.TryValidate(request, out var results);

        Assert.True(isValid);
        Assert.Empty(results);
    }

    [Fact]
    public void MissingItems_ShouldBeInvalid()
    {
        var request = new CreateOrderRequest(
            Guid.NewGuid(),
            new List<OrderItemRequest>(),
            null,
            null);

        var isValid = ValidationHelper.TryValidate(request, out var results);

        Assert.False(isValid);
        Assert.Contains(results, r => r.ErrorMessage!.Contains("order must contain"));
    }
}
