using BelaDesignHub.Application.Models.Requests;
using BelaDesignHub.Application.Tests.TestHelpers;

namespace BelaDesignHub.Application.Tests.Requests;

public class UpdateCustomerRequestTests
{
    [Fact]
    public void ValidRequest_ShouldBeValid()
    {
        var request = new UpdateCustomerRequest(
            "Cliente Teste",
            "cliente@teste.com",
            "11999999999",
            "Rua A, 123");

        var isValid = ValidationHelper.TryValidate(request, out var results);

        Assert.True(isValid);
        Assert.Empty(results);
    }

    [Fact]
    public void NameNull_ShouldBeInvalid()
    {
        var request = new UpdateCustomerRequest(
            null!,
            "cliente@teste.com",
            null,
            null);

        var isValid = ValidationHelper.TryValidate(request, out var results);

        Assert.False(isValid);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(UpdateCustomerRequest.Name)));
    }

    [Fact]
    public void EmailTooLong_ShouldBeInvalid()
    {
        var request = new UpdateCustomerRequest(
            "Cliente",
            new string('a', 200) + "@teste.com",
            null,
            null);

        var isValid = ValidationHelper.TryValidate(request, out var results);

        Assert.False(isValid);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(UpdateCustomerRequest.Email)));
    }
}
