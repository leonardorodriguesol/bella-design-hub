using System.Net;
using System.Net.Http.Json;
using BelaDesignHub.Api.Tests.Infrastructure;
using BelaDesignHub.Application.Models.Requests;
using BelaDesignHub.Domain.Entities;

namespace BelaDesignHub.Api.Tests.Controllers;

public class CustomersControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public CustomersControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateCustomer_ShouldPersistAndReturnCustomer()
    {
        var payload = new CreateCustomerRequest("Cliente Teste", "cliente@teste.com", "11999999999", "Rua A, 123");

        var response = await _client.PostAsJsonAsync("/api/customers", payload);
        response.EnsureSuccessStatusCode();

        var created = await response.Content.ReadFromJsonAsync<Customer>();

        Assert.NotNull(created);
        Assert.Equal(payload.Name, created!.Name);

        var listResponse = await _client.GetAsync("/api/customers");
        listResponse.EnsureSuccessStatusCode();
        var customers = await listResponse.Content.ReadFromJsonAsync<List<Customer>>();

        Assert.Contains(customers!, c => c.Id == created.Id);
    }

    [Fact]
    public async Task UpdateCustomer_ShouldReturnUpdatedCustomer()
    {
        var created = await CreateCustomerAsync("Cliente Update", "update@teste.com");
        var updateRequest = new UpdateCustomerRequest("Cliente Atualizado", "novo@teste.com", "11888888888", "Rua B, 456");

        var response = await _client.PutAsJsonAsync($"/api/customers/{created.Id}", updateRequest);
        response.EnsureSuccessStatusCode();

        var updated = await response.Content.ReadFromJsonAsync<Customer>();

        Assert.NotNull(updated);
        Assert.Equal(updateRequest.Name, updated!.Name);
        Assert.Equal(updateRequest.Email, updated.Email);
        Assert.Equal(updateRequest.Address, updated.Address);
    }

    [Fact]
    public async Task GetCustomerById_ShouldReturnPersistedCustomer()
    {
        var created = await CreateCustomerAsync("Cliente GET", "get@teste.com");

        var response = await _client.GetAsync($"/api/customers/{created.Id}");
        response.EnsureSuccessStatusCode();

        var fetched = await response.Content.ReadFromJsonAsync<Customer>();

        Assert.NotNull(fetched);
        Assert.Equal(created.Id, fetched!.Id);
        Assert.Equal(created.Email, fetched.Email);
    }

    [Fact]
    public async Task UpdateCustomer_WhenDoesNotExist_ShouldReturnNotFound()
    {
        var updateRequest = new UpdateCustomerRequest("Inexistente", null, null, null);

        var response = await _client.PutAsJsonAsync($"/api/customers/{Guid.NewGuid()}", updateRequest);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteCustomer_ShouldRemoveCustomer()
    {
        var created = await CreateCustomerAsync("Cliente Delete", "delete@teste.com");

        var deleteResponse = await _client.DeleteAsync($"/api/customers/{created.Id}");
        deleteResponse.EnsureSuccessStatusCode();

        var getResponse = await _client.GetAsync($"/api/customers/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    private async Task<Customer> CreateCustomerAsync(string name, string? email)
    {
        var payload = new CreateCustomerRequest(name, email, "11999999999", "Rua A, 123");
        var response = await _client.PostAsJsonAsync("/api/customers", payload);
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<Customer>())!;
    }
}
