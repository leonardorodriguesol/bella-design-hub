using System.ComponentModel.DataAnnotations;

namespace BelaDesignHub.Application.Tests.TestHelpers;

public static class ValidationHelper
{
    public static bool TryValidate(object model, out List<ValidationResult> results)
    {
        results = new List<ValidationResult>();
        var context = new ValidationContext(model);
        return Validator.TryValidateObject(model, context, results, validateAllProperties: true);
    }
}
