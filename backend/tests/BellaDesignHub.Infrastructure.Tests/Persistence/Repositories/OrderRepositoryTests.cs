using BellaDesignHub.Application.Orders;
using BellaDesignHub.Domain.Entities;
using BellaDesignHub.Infrastructure.Persistence.Data;
using BellaDesignHub.Infrastructure.Persistence.Repositories;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace BellaDesignHub.Infrastructure.Tests.Persistence.Repositories;

public class OrderRepositoryTests
{
    [Fact]
    public async Task AddAsync_AndGetByIdAsync_ShouldPersistOrderWithItems()
    {
        await using var connection = CreateConnection();
        await using var context = CreateContext(connection);
        var customer = new Customer { Name = "Cliente Infra" };
        await context.Customers.AddAsync(customer);
        await context.SaveChangesAsync();
        var repository = new OrderRepository(context);
        var order = new Order
        {
            CustomerId = customer.Id,
            Code = "PED-INFRA-1",
            Items =
            [
                new OrderItem
                {
                    Description = "Tampo",
                    Quantity = 2,
                    UnitPrice = 90m
                }
            ],
            TotalAmount = 180m
        };

        await repository.AddAsync(order, CancellationToken.None);
        await repository.SaveChangesAsync(CancellationToken.None);

        var persisted = await repository.GetByIdAsync(order.Id, asNoTracking: true, CancellationToken.None);

        Assert.NotNull(persisted);
        Assert.Equal(order.Code, persisted!.Code);
        Assert.Single(persisted.Items);
        Assert.Equal(180m, persisted.TotalAmount);
    }

    [Fact]
    public async Task ReplaceItems_ShouldRemoveOldItemsAndPersistNewOnes()
    {
        await using var connection = CreateConnection();
        await using var seedContext = CreateContext(connection);
        var customer = new Customer { Name = "Cliente Replace" };
        await seedContext.Customers.AddAsync(customer);
        await seedContext.SaveChangesAsync();
        var originalOrder = new Order
        {
            CustomerId = customer.Id,
            Code = "PED-OLD",
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
        await seedContext.Orders.AddAsync(originalOrder);
        await seedContext.SaveChangesAsync();

        await using var context = CreateContext(connection);
        var repository = new OrderRepository(context);
        var trackedOrder = await repository.GetByIdAsync(originalOrder.Id, asNoTracking: false, CancellationToken.None);
        Assert.NotNull(trackedOrder);
        var replacements = new List<OrderItem>
        {
            new()
            {
                OrderId = trackedOrder!.Id,
                Description = "Item novo A",
                Quantity = 2,
                UnitPrice = 150m
            },
            new()
            {
                OrderId = trackedOrder.Id,
                Description = "Item novo B",
                Quantity = 1,
                UnitPrice = 50m
            }
        };

        repository.ReplaceItems(trackedOrder!, replacements);
        trackedOrder.TotalAmount = replacements.Sum(item => item.Total);
        await repository.SaveChangesAsync(CancellationToken.None);

        await using var verificationContext = CreateContext(connection);
        var persistedOrder = await verificationContext.Orders
            .AsNoTracking()
            .Include(order => order.Items)
            .SingleAsync(order => order.Id == originalOrder.Id);

        Assert.Equal(2, persistedOrder.Items.Count);
        Assert.DoesNotContain(persistedOrder.Items, item => item.Description == "Item antigo");
        Assert.Equal(350m, persistedOrder.TotalAmount);
    }

    [Fact]
    public async Task ListAsync_ShouldApplyFiltersAndSortByCreatedAtDescending()
    {
        await using var connection = CreateConnection();
        await using var context = CreateContext(connection);
        var customerA = new Customer { Name = "Cliente A" };
        var customerB = new Customer { Name = "Cliente B" };
        await context.Customers.AddRangeAsync(customerA, customerB);
        await context.SaveChangesAsync();

        var olderOrder = new Order
        {
            CustomerId = customerA.Id,
            Code = "PED-1",
            Status = OrderStatus.Pending,
            CreatedAt = DateTime.UtcNow.AddDays(-3),
            TotalAmount = 100m
        };
        var newerOrder = new Order
        {
            CustomerId = customerA.Id,
            Code = "PED-2",
            Status = OrderStatus.Pending,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            TotalAmount = 300m
        };
        var otherCustomerOrder = new Order
        {
            CustomerId = customerB.Id,
            Code = "PED-3",
            Status = OrderStatus.Cancelled,
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            TotalAmount = 200m
        };
        await context.Orders.AddRangeAsync(olderOrder, newerOrder, otherCustomerOrder);
        await context.SaveChangesAsync();

        var repository = new OrderRepository(context);
        var filter = new OrderQueryFilter(
            customerA.Id,
            OrderStatus.Pending,
            DateTime.UtcNow.AddDays(-4),
            DateTime.UtcNow);

        var result = await repository.ListAsync(filter, CancellationToken.None);

        Assert.Equal(2, result.Count);
        Assert.Equal("PED-2", result[0].Code);
        Assert.Equal("PED-1", result[1].Code);
    }

    [Fact]
    public async Task GetExistingProductIdsAsync_ShouldReturnOnlyPersistedIds()
    {
        await using var connection = CreateConnection();
        await using var context = CreateContext(connection);
        var productA = new Product { Name = "Produto A", DefaultSalePrice = 10m };
        var productB = new Product { Name = "Produto B", DefaultSalePrice = 20m };
        await context.Products.AddRangeAsync(productA, productB);
        await context.SaveChangesAsync();

        var repository = new OrderRepository(context);
        var requestedIds = new List<Guid> { productA.Id, Guid.NewGuid() };

        var existingIds = await repository.GetExistingProductIdsAsync(requestedIds, CancellationToken.None);

        Assert.Single(existingIds);
        Assert.Contains(productA.Id, existingIds);
    }

    private static SqliteConnection CreateConnection()
    {
        var connection = new SqliteConnection("Data Source=:memory:");
        connection.Open();
        return connection;
    }

    private static ApplicationDbContext CreateContext(SqliteConnection connection)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;
        var context = new ApplicationDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }
}
