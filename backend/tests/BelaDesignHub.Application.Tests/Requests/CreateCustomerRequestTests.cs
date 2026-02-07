using BelaDesignHub.Application.Models.Requests;
using BelaDesignHub.Application.Tests.TestHelpers;

namespace BelaDesignHub.Application.Tests.Requests;

public class CreateCustomerRequestTests
{
    [Fact]
    public void ValidRequest_ShouldBeValid()
    {
        var request = new CreateCustomerRequest(
            "Cliente Teste",
            "cliente@teste.com",
            "11999999999",
            "Rua A, 123");

        var isValid = ValidationHelper.TryValidate(request, out var results);

        Assert.True(isValid);
        Assert.Empty(results);
    }

    [Fact]
    public void MissingName_ShouldBeInvalid()
    {
        var request = new CreateCustomerRequest(
            string.Empty,
            "cliente@teste.com",
            null,
            null);

        var isValid = ValidationHelper.TryValidate(request, out var results);

        Assert.False(isValid);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(CreateCustomerRequest.Name)));
    }

    [Fact]
    public void InvalidEmail_ShouldBeInvalid()
    {
        var request = new CreateCustomerRequest(
            "Cliente",
            "email-invalido",
            null,
            null);

        var isValid = ValidationHelper.TryValidate(request, out var results);

        Assert.False(isValid);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(CreateCustomerRequest.Email)));
    }
}
