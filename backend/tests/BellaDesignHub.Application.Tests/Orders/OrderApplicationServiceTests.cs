using System.Text.RegularExpressions;
using BellaDesignHub.Application.Models.Requests;
using BellaDesignHub.Application.Orders;
using BellaDesignHub.Domain.Entities;

namespace BellaDesignHub.Application.Tests.Orders;

public class OrderApplicationServiceTests
{
    [Fact]
    public async Task CreateOrderAsync_WhenRequestIsValid_ShouldGenerateOrderAndCalculateTotal()
    {
        var customerId = Guid.NewGuid();
        var productId = Guid.NewGuid();
        var repository = new FakeOrderRepository();
        repository.Customers.Add(customerId);
        repository.Products.Add(productId);
        var sut = new OrderApplicationService(repository);
        var request = new CreateOrderRequest(
            customerId,
            [
                new OrderItemRequest(productId, "Painel planejado", 2, 350m),
                new OrderItemRequest(null, "Montagem", 1, 120m)
            ],
            null,
            DateTime.UtcNow.AddDays(5));

        var result = await sut.CreateOrderAsync(request, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Matches(new Regex("^PED-\\d{14}$"), result.Value!.Code);
        Assert.Equal(820m, result.Value.TotalAmount);
        Assert.Equal(2, result.Value.Items.Count);
        Assert.Equal(1, repository.SaveChangesCalls);
    }

    [Fact]
    public async Task CreateOrderAsync_WhenCustomerDoesNotExist_ShouldReturnCustomerNotFound()
    {
        var repository = new FakeOrderRepository();
        var sut = new OrderApplicationService(repository);
        var request = new CreateOrderRequest(
            Guid.NewGuid(),
            [new OrderItemRequest("Item", 1, 10m)],
            null,
            null);

        var result = await sut.CreateOrderAsync(request, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(OrderOperationError.CustomerNotFound, result.Error);
        Assert.Null(result.Value);
        Assert.Empty(repository.Orders);
        Assert.Equal(0, repository.SaveChangesCalls);
    }

    [Fact]
    public async Task CreateOrderAsync_WhenProductIsInvalid_ShouldReturnInvalidProducts()
    {
        var customerId = Guid.NewGuid();
        var repository = new FakeOrderRepository();
        repository.Customers.Add(customerId);
        var sut = new OrderApplicationService(repository);
        var request = new CreateOrderRequest(
            customerId,
            [new OrderItemRequest(Guid.NewGuid(), "Item com produto", 1, 10m)],
            null,
            null);

        var result = await sut.CreateOrderAsync(request, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(OrderOperationError.InvalidProducts, result.Error);
        Assert.Empty(repository.Orders);
        Assert.Equal(0, repository.SaveChangesCalls);
    }

    [Fact]
    public async Task UpdateOrderAsync_WhenOrderDoesNotExist_ShouldReturnNotFound()
    {
        var repository = new FakeOrderRepository();
        var sut = new OrderApplicationService(repository);
        var request = new UpdateOrderRequest(
            "PED-123",
            OrderStatus.InProduction,
            DateTime.UtcNow.AddDays(1),
            [new OrderItemRequest("Item", 1, 100m)]);

        var result = await sut.UpdateOrderAsync(Guid.NewGuid(), request, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(OrderOperationError.NotFound, result.Error);
        Assert.Equal(0, repository.SaveChangesCalls);
    }

    [Fact]
    public async Task UpdateOrderAsync_WhenRequestIsValid_ShouldReplaceItemsAndRecalculateTotal()
    {
        var existingOrder = new Order
        {
            Id = Guid.NewGuid(),
            Code = "PED-OLD",
            CustomerId = Guid.NewGuid(),
            Items =
            [
                new OrderItem
                {
                    Description = "Item antigo",
                    Quantity = 1,
                    UnitPrice = 200m
                }
            ],
            TotalAmount = 200m
        };
        var productId = Guid.NewGuid();
        var repository = new FakeOrderRepository();
        repository.Orders.Add(existingOrder);
        repository.Products.Add(productId);
        var sut = new OrderApplicationService(repository);
        var request = new UpdateOrderRequest(
            "PED-ATUAL",
            OrderStatus.Shipped,
            DateTime.UtcNow.AddDays(3),
            [new OrderItemRequest(productId, "Novo item", 3, 50m)]);

        var result = await sut.UpdateOrderAsync(existingOrder.Id, request, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal("PED-ATUAL", result.Value!.Code);
        Assert.Equal(OrderStatus.Shipped, result.Value.Status);
        Assert.Single(result.Value.Items);
        Assert.Equal("Novo item", result.Value.Items.Single().Description);
        Assert.Equal(150m, result.Value.TotalAmount);
        Assert.Equal(1, repository.SaveChangesCalls);
    }

    [Fact]
    public async Task UpdateOrderAsync_WhenCodeIsBlank_ShouldKeepExistingCode()
    {
        var existingOrder = new Order
        {
            Id = Guid.NewGuid(),
            Code = "PED-EXISTENTE",
            CustomerId = Guid.NewGuid(),
            Items =
            [
                new OrderItem
                {
                    Description = "Item antigo",
                    Quantity = 1,
                    UnitPrice = 100m
                }
            ]
        };
        var repository = new FakeOrderRepository();
        repository.Orders.Add(existingOrder);
        var sut = new OrderApplicationService(repository);
        var request = new UpdateOrderRequest(
            "   ",
            OrderStatus.InProduction,
            DateTime.UtcNow.AddDays(2),
            [new OrderItemRequest("Novo item", 1, 80m)]);

        var result = await sut.UpdateOrderAsync(existingOrder.Id, request, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("PED-EXISTENTE", result.Value!.Code);
    }

    private sealed class FakeOrderRepository : IOrderRepository
    {
        public List<Order> Orders { get; } = [];
        public HashSet<Guid> Customers { get; } = [];
        public HashSet<Guid> Products { get; } = [];
        public int SaveChangesCalls { get; private set; }

        public Task<List<Order>> ListAsync(OrderQueryFilter filter, CancellationToken cancellationToken)
        {
            var query = Orders.AsEnumerable();

            if (filter.CustomerId.HasValue)
            {
                query = query.Where(order => order.CustomerId == filter.CustomerId.Value);
            }

            if (filter.Status.HasValue)
            {
                query = query.Where(order => order.Status == filter.Status.Value);
            }

            if (filter.CreatedFrom.HasValue)
            {
                query = query.Where(order => order.CreatedAt >= filter.CreatedFrom.Value);
            }

            if (filter.CreatedTo.HasValue)
            {
                query = query.Where(order => order.CreatedAt <= filter.CreatedTo.Value);
            }

            return Task.FromResult(query.OrderByDescending(order => order.CreatedAt).ToList());
        }

        public Task<Order?> GetByIdAsync(Guid id, bool asNoTracking, CancellationToken cancellationToken)
        {
            return Task.FromResult(Orders.FirstOrDefault(order => order.Id == id));
        }

        public Task<bool> CustomerExistsAsync(Guid customerId, CancellationToken cancellationToken)
        {
            return Task.FromResult(Customers.Contains(customerId));
        }

        public Task<IReadOnlyCollection<Guid>> GetExistingProductIdsAsync(
            IReadOnlyCollection<Guid> productIds,
            CancellationToken cancellationToken)
        {
            var existingIds = productIds
                .Where(productId => Products.Contains(productId))
                .ToList();

            return Task.FromResult<IReadOnlyCollection<Guid>>(existingIds);
        }

        public Task AddAsync(Order order, CancellationToken cancellationToken)
        {
            Orders.Add(order);
            return Task.CompletedTask;
        }

        public void ReplaceItems(Order order, IReadOnlyCollection<OrderItem> newItems)
        {
            order.Items = newItems.ToList();
        }

        public void Remove(Order order)
        {
            Orders.Remove(order);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            SaveChangesCalls++;
            return Task.CompletedTask;
        }
    }
}
