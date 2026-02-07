using System.Net;
using System.Net.Http.Json;
using BelaDesignHub.Api.Tests.Infrastructure;
using BelaDesignHub.Application.Models.Requests;
using BelaDesignHub.Domain.Entities;

namespace BelaDesignHub.Api.Tests.Controllers;

public class OrdersControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public OrdersControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateOrder_ShouldReturnOrderWithItems()
    {
        var customer = await CreateCustomerAsync("Cliente Pedido", "pedido@teste.com");
        var order = await CreateOrderAsync(customer.Id,
            new List<OrderItemRequest>
            {
                new("Armário sob medida", 1, 2500m),
                new("Instalação", 1, 500m)
            });

        Assert.NotNull(order);
        Assert.Equal(2, order!.Items.Count);
        Assert.Equal(3000m, order.TotalAmount);
    }

    [Fact]
    public async Task GetOrders_FilterByCustomer_ShouldReturnOnlyCustomerOrders()
    {
        var customerA = await CreateCustomerAsync("Cliente Filtro", "filtro@teste.com");
        var customerB = await CreateCustomerAsync("Outro Cliente", "outro@teste.com");

        await CreateOrderAsync(customerA.Id);
        await CreateOrderAsync(customerB.Id);

        var response = await _client.GetAsync($"/api/orders?customerId={customerA.Id}");
        response.EnsureSuccessStatusCode();

        var orders = await response.Content.ReadFromJsonAsync<List<Order>>();

        Assert.NotNull(orders);
        Assert.NotEmpty(orders);
        Assert.All(orders!, o => Assert.Equal(customerA.Id, o.CustomerId));
    }

    [Fact]
    public async Task UpdateOrder_ShouldReplaceItemsAndUpdateStatus()
    {
        var customer = await CreateCustomerAsync("Cliente Update", "update@teste.com");
        var order = await CreateOrderAsync(customer.Id);

        var updateRequest = new UpdateOrderRequest(
            "PED-ATUALIZADO",
            OrderStatus.InProduction,
            DateTime.UtcNow.AddDays(2),
            new List<OrderItemRequest>
            {
                new("Novo item", 2, 800m)
            });

        var response = await _client.PutAsJsonAsync($"/api/orders/{order.Id}", updateRequest);
        response.EnsureSuccessStatusCode();

        var updated = await response.Content.ReadFromJsonAsync<Order>();

        Assert.NotNull(updated);
        Assert.Equal(updateRequest.Code, updated!.Code);
        Assert.Equal(updateRequest.Status, updated.Status);
        Assert.Single(updated.Items);
        Assert.Equal(1600m, updated.TotalAmount);
    }

    [Fact]
    public async Task UpdateOrder_WhenDoesNotExist_ShouldReturnNotFound()
    {
        var updateRequest = new UpdateOrderRequest(
            null,
            OrderStatus.Cancelled,
            null,
            new List<OrderItemRequest>
            {
                new("Item", 1, 100m)
            });

        var response = await _client.PutAsJsonAsync($"/api/orders/{Guid.NewGuid()}", updateRequest);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetOrderById_ShouldReturnCreatedOrder()
    {
        var customer = await CreateCustomerAsync("Cliente GET", "get@teste.com");
        var order = await CreateOrderAsync(customer.Id);

        var response = await _client.GetAsync($"/api/orders/{order.Id}");
        response.EnsureSuccessStatusCode();

        var fetched = await response.Content.ReadFromJsonAsync<Order>();

        Assert.NotNull(fetched);
        Assert.Equal(order.Id, fetched!.Id);
        Assert.Equal(order.Items.Count, fetched.Items.Count);
    }

    [Fact]
    public async Task DeleteOrder_ShouldReturnNotFoundAfterDeletion()
    {
        var customer = await CreateCustomerAsync("Cliente Delete", "delete@teste.com");
        var order = await CreateOrderAsync(customer.Id);

        var deleteResponse = await _client.DeleteAsync($"/api/orders/{order.Id}");
        deleteResponse.EnsureSuccessStatusCode();

        var getResponse = await _client.GetAsync($"/api/orders/{order.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    private async Task<Order> CreateOrderAsync(Guid customerId, List<OrderItemRequest>? items = null)
    {
        var request = new CreateOrderRequest(
            customerId,
            items ??
            [
                new("Projeto", 1, 1000m)
            ],
            null,
            DateTime.UtcNow.AddDays(7));

        var response = await _client.PostAsJsonAsync("/api/orders", request);
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<Order>())!;
    }

    private async Task<Customer> CreateCustomerAsync(string name, string email)
    {
        var payload = new CreateCustomerRequest(name, email, null, null);
        var response = await _client.PostAsJsonAsync("/api/customers", payload);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"CreateCustomerAsync failure payload: {body}");
            throw new InvalidOperationException($"Failed to create customer ({response.StatusCode}): {body}");
        }

        return (await response.Content.ReadFromJsonAsync<Customer>())!;
    }
}
