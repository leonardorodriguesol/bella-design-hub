using System.Net;
using System.Net.Http.Json;
using BelaDesignHub.Api.Tests.Infrastructure;
using BelaDesignHub.Application.Models.Requests;
using BelaDesignHub.Domain.Entities;

namespace BelaDesignHub.Api.Tests.Controllers;

public class ExpensesControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ExpensesControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateExpense_ThenFilterByDate_ShouldReturnEntry()
    {
        var today = DateTime.UtcNow.Date;
        var request = new CreateExpenseRequest("Compra MDF", 1200m, ExpenseCategory.Materials, today, null);

        var createResponse = await _client.PostAsJsonAsync("/api/expenses", request);
        createResponse.EnsureSuccessStatusCode();

        var listResponse = await _client.GetAsync($"/api/expenses?startDate={today:O}&endDate={today.AddDays(1):O}");
        listResponse.EnsureSuccessStatusCode();

        var expenses = await listResponse.Content.ReadFromJsonAsync<List<Expense>>();

        Assert.Contains(expenses!, e => e.Description == request.Description && e.Amount == request.Amount);
    }

    [Fact]
    public async Task UpdateExpense_ShouldReturnUpdatedEntity()
    {
        var created = await CreateExpenseAsync();
        var newDate = created.ExpenseDate.AddDays(3);
        var updateRequest = new UpdateExpenseRequest("Frete", 900m, ExpenseCategory.Logistics, newDate, "Entrega urgente");

        var response = await _client.PutAsJsonAsync($"/api/expenses/{created.Id}", updateRequest);
        response.EnsureSuccessStatusCode();

        var updated = await response.Content.ReadFromJsonAsync<Expense>();

        Assert.NotNull(updated);
        Assert.Equal(updateRequest.Description, updated!.Description);
        Assert.Equal(updateRequest.Amount, updated.Amount);
        Assert.Equal(updateRequest.Category, updated.Category);
    }

    [Fact]
    public async Task GetExpenseById_ShouldReturnPersistedExpense()
    {
        var created = await CreateExpenseAsync();

        var response = await _client.GetAsync($"/api/expenses/{created.Id}");
        response.EnsureSuccessStatusCode();

        var expense = await response.Content.ReadFromJsonAsync<Expense>();

        Assert.NotNull(expense);
        Assert.Equal(created.Id, expense!.Id);
    }

    [Fact]
    public async Task UpdateExpense_WhenDoesNotExist_ShouldReturnNotFound()
    {
        var newDate = DateTime.UtcNow.Date;
        var updateRequest = new UpdateExpenseRequest("Frete", 900m, ExpenseCategory.Logistics, newDate, null);

        var response = await _client.PutAsJsonAsync($"/api/expenses/{Guid.NewGuid()}", updateRequest);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteExpense_ShouldReturnNoContentAndNotFoundAfterwards()
    {
        var created = await CreateExpenseAsync();

        var deleteResponse = await _client.DeleteAsync($"/api/expenses/{created.Id}");
        deleteResponse.EnsureSuccessStatusCode();

        var getResponse = await _client.GetAsync($"/api/expenses/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    private async Task<Expense> CreateExpenseAsync()
    {
        var today = DateTime.UtcNow.Date;
        var request = new CreateExpenseRequest("Compra MDF", 1200m, ExpenseCategory.Materials, today, null);
        var response = await _client.PostAsJsonAsync("/api/expenses", request);
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<Expense>())!;
    }
}
